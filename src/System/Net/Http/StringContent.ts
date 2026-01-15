import { HttpContent } from "./HttpContent";
import { MemoryStream } from "../../IO/MemoryStream";
import { Stream } from "../../IO/Stream";

export class StringContent extends HttpContent {
    private readonly _content: MemoryStream;

    constructor(content: string, encoding: string = "utf-8", mediaType: string = "text/plain") {
        super();
        const buffer = Buffer.from(content, encoding as BufferEncoding); // Use Buffer.from for encoding support
        this._content = new MemoryStream(buffer.length);
        this._content.Write(buffer, 0, buffer.length);
        this._content.Position = 0;

        this.Headers.Add("Content-Type", `${mediaType}; charset=${encoding}`);
        // MemoryStream Length is available
        this.Headers.Add("Content-Length", this._content.Length.toString());
    }

    public async ReadAsStreamAsync(): Promise<Stream> {
        return Promise.resolve(this._content);
    }

    protected async SerializeToStreamAsync(stream: Stream, context?: any): Promise<void> {
        this._content.Position = 0;
        await this._content.CopyToAsync(stream);
    }

    protected override DisposeInternal(disposing: boolean): void {
        if (disposing) {
            this._content.Dispose();
        }
        super.DisposeInternal(disposing);
    }
}
