import { HttpMessageHandler } from "./HttpMessageHandler";
import { HttpRequestMessage } from "./HttpRequestMessage";
import { HttpResponseMessage } from "./HttpResponseMessage";
import { CancellationToken } from "../../Threading/CancellationToken";
import { Task } from "../../../Domain/Threading/Tasks/Task";
import { HttpStatusCode } from "./HttpStatusCode";
import { StringContent } from "./StringContent";
import { CsString } from "../../../Domain/ValueObjects/CsString";

export class HttpClientHandler extends HttpMessageHandler {
    public override async SendAsync(
        request: HttpRequestMessage,
        cancellationToken?: CancellationToken,
    ): Task<HttpResponseMessage> {
        this.CheckDisposed();
        cancellationToken?.ThrowIfCancellationRequested();

        // 1. Prepare Headers
        const fetchHeaders: Record<string, string> = {};

        // Request Headers
        if (request.Headers) {
            for (const [key, values] of request.Headers) {
                fetchHeaders[key] = values.join(", ");
            }
        }

        // Content Headers
        if (request.Content && request.Content.Headers) {
            for (const [key, values] of request.Content.Headers) {
                fetchHeaders[key] = values.join(", ");
            }
        }

        // 2. Extract Body
        let body: BodyInit | undefined = undefined;
        if (request.Content) {
            const stream = await request.Content.ReadAsStreamAsync();

            // Read stream into Uint8Array
            const chunks: Uint8Array[] = [];
            let totalLen = 0;
            const buffer = new Uint8Array(8192);
            while (true) {
                const read = await stream.ReadAsync(buffer, 0, buffer.length);
                if (read === 0) break;
                const chunk = new Uint8Array(read);
                chunk.set(buffer.subarray(0, read));
                chunks.push(chunk);
                totalLen += read;
            }

            const fullBody = new Uint8Array(totalLen);
            let offset = 0;
            for (const c of chunks) {
                fullBody.set(c, offset);
                offset += c.length;
            }
            body = fullBody;
        }

        const method = request.Method.Method.toString();
        const uri = request.RequestUri!.toString();

        // 3. Execute fetch
        const response = await fetch(uri, {
            method: method,
            headers: fetchHeaders,
            body: body,
            // signal: cancellationToken... // Implement abort if we had full Token impl
        });

        // 4. Convert Response
        const responseMessage = new HttpResponseMessage(response.status as HttpStatusCode);
        responseMessage.ReasonPhrase = new CsString(response.statusText);

        // Headers
        response.headers.forEach((value, key) => {
            responseMessage.Headers.Add(key, value);
        });

        // Body
        const text = await response.text();
        responseMessage.Content = new StringContent(text);

        responseMessage.RequestMessage = request;

        return responseMessage;
    }
}
