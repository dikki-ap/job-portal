namespace JobPortal.Web.Common;

/// <summary>
/// Validates that an uploaded file's leading bytes match the magic bytes expected
/// for its declared MIME type. Prevents content-type spoofing (e.g. uploading an
/// executable with Content-Type: image/png).
/// </summary>
internal static class FileSignatureValidator
{
    // Each entry maps a MIME type to one or more valid magic-byte sequences.
    private static readonly Dictionary<string, byte[][]> Signatures = new()
    {
        ["application/pdf"] =
        [
            [0x25, 0x50, 0x44, 0x46], // %PDF
        ],
        ["image/png"] =
        [
            [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
        ],
        ["image/jpeg"] =
        [
            [0xFF, 0xD8, 0xFF],
        ],
        ["image/gif"] =
        [
            [0x47, 0x49, 0x46, 0x38], // GIF8
        ],
        ["application/msword"] =
        [
            [0xD0, 0xCF, 0x11, 0xE0], // Legacy .doc (OLE2 compound document)
        ],
        ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"] =
        [
            [0x50, 0x4B, 0x03, 0x04], // .docx is a ZIP archive
        ],
        ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] =
        [
            [0x50, 0x4B, 0x03, 0x04], // .xlsx is a ZIP archive
        ],
    };

    /// <summary>
    /// Returns true when the stream's leading bytes match the expected signature.
    /// The stream is rewound to position 0 before and after the check.
    /// For MIME types not in the signature table the check always passes —
    /// callers are responsible for maintaining a MIME whitelist.
    /// </summary>
    public static bool IsValidSignature(Stream stream, string mimeType)
    {
        if (!stream.CanSeek)
            return true; // Can't validate non-seekable streams; let other checks handle it.

        stream.Position = 0;

        // SVG is XML text — no binary magic bytes, validate by XML/SVG opening tag.
        if (mimeType == "image/svg+xml")
        {
            Span<byte> buf = stackalloc byte[128];
            var read = stream.Read(buf);
            stream.Position = 0;
            var header = System.Text.Encoding.UTF8.GetString(buf[..read]).TrimStart();
            return header.StartsWith("<svg", StringComparison.OrdinalIgnoreCase)
                || header.StartsWith("<?xml", StringComparison.OrdinalIgnoreCase);
        }

        if (!Signatures.TryGetValue(mimeType, out var sigs))
            return true; // Unknown type — defer to caller's MIME whitelist.

        Span<byte> header2 = stackalloc byte[8];
        var bytesRead = stream.Read(header2);
        stream.Position = 0;

        foreach (var sig in sigs)
        {
            if (bytesRead >= sig.Length && header2[..sig.Length].SequenceEqual(sig))
                return true;
        }

        return false;
    }
}
