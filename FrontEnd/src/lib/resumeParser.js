import pdfToText from "react-pdftotext";

export async function extractResumeText(file) {
  if (!file) return "";
  const fileType = file.name.split(".").pop().toLowerCase();
  if (fileType !== "pdf") {
    // For now we only support PDF client-side extraction
    throw new Error("Unsupported file type for client-side extraction");
  }
  // pdfToText returns a Promise<string>
  const text = await pdfToText(file);
  return text || "";
}

export default extractResumeText;
