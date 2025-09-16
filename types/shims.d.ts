declare module 'html-to-docx' {
  const htmlToDocx: (html: string, options?: any) => Promise<Blob>;
  export default htmlToDocx;
}

declare module 'jspdf' {
  const jsPDF: any;
  export default jsPDF;
}

declare module 'html2canvas' {
  const html2canvas: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
  export default html2canvas;
}
