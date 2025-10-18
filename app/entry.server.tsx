import type { AppLoadContext, EntryContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { isbot } from 'isbot';
import * as ReactDOMServer from 'react-dom/server';
import { PassThrough } from 'node:stream';
import { renderHeadToString } from 'remix-island';
import { Head } from './root';
import { themeStore } from '~/lib/stores/theme';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  _loadContext: AppLoadContext,
) {
  const ua = request.headers.get('user-agent') || '';
  const isBot = isbot(ua);
  const encoder = new TextEncoder();
  const head = renderHeadToString({ request, remixContext, Head });

  // Non-streaming path for bots: return fully rendered HTML
  if (isBot) {
    try {
      const markup = ReactDOMServer.renderToString(
        <RemixServer context={remixContext} url={request.url} />,
      );
      const html = `<!DOCTYPE html><html lang="en" data-theme="${themeStore.value}"><head>${head}</head><body><div id="root" class="w-full h-full">${markup}</div></body></html>`;

      responseHeaders.set('Content-Type', 'text/html');
      responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
      responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

      return new Response(html, {
        headers: responseHeaders,
        status: responseStatusCode,
      });
    } catch (error) {
      console.error(error);
      responseStatusCode = 500;
    }
  }

  // Streaming path for normal clients using Node stream -> Web stream bridge
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(
        encoder.encode(
          `<!DOCTYPE html><html lang="en" data-theme="${themeStore.value}"><head>${head}</head><body><div id="root" class="w-full h-full">`,
        ),
      );

      const { pipe, abort } = ReactDOMServer.renderToPipeableStream(
        <RemixServer context={remixContext} url={request.url} />,
        {
          onShellReady() {
            const nodeStream = new PassThrough();
            pipe(nodeStream);
            nodeStream.on('data', (chunk) => {
              // chunk can be Buffer|string
              if (typeof chunk === 'string') {
                controller.enqueue(encoder.encode(chunk));
              } else {
                controller.enqueue(new Uint8Array(chunk));
              }
            });
            nodeStream.on('end', () => {
              controller.enqueue(encoder.encode(`</div></body></html>`));
              controller.close();
            });
            nodeStream.on('error', (err) => {
              console.error(err);
              controller.error(err);
            });
          },
          onShellError(err) {
            console.error(err);
            responseStatusCode = 500;
          },
          onError(err) {
            console.error(err);
            responseStatusCode = 500;
          },
        },
      );

      // Support request aborts
      if (request.signal.aborted) abort();
      request.signal.addEventListener('abort', () => abort());
    },
    cancel() {
      // nothing to cleanup: nodeStream ends will close the controller
    },
  });

  responseHeaders.set('Content-Type', 'text/html');

  responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
  responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
