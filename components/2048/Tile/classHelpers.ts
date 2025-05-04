export function colorMapper(value: number) {
  switch (value) {
    case 2:
      // crème très claire, texte bordeaux très foncé
      return "bg-[#F8EDE7] text-[#4a002b]";
    case 4:
      // violet vibrant
      return "bg-[#836EF9] text-white";
    case 8:
      // turquoise éclatant
      return "bg-[#803370] text-white";
    case 16:
      // magenta fort
      
      return "bg-[#5FEDDF] text-[#1c5e57]";
    case 32:
      // violet foncé
      return "bg-[#A0055D] text-white";
    case 64:
      // bleu nuit
      return "bg-[#1c5e57] text-white";
    case 128:
      // lavande prononcée
      return "bg-[#b5a8fa] text-[#200052]";
    case 256:
      // lavande pâle
      return "bg-[#ccc4fc] text-[#200052]";
    case 512:
      // rose pastel doux
      return "bg-[#d99cbf] text-[#26001f]";
    case 1024:
      // aqua très pâle
      return "bg-[#bff7f2] text-[#1c5e57]";
    case 2048:
      // magenta profond
      return "bg-[#60004E] text-white shadow-lg shadow-[#A0055D]/50";
    case 4096:
      // rose frais
      return "bg-[#b2387d] text-white shadow-lg shadow-[#b2387d]/50";
    case 8192:
      // rose moyen
      return "bg-[#c7699e] text-white shadow-lg shadow-[#c7699e]/50";
    case 16384:
      // pastel léger
      return "bg-[#9ef5ed] text-[#1c5e57] shadow-lg shadow-[#9ef5ed]/50";
    default:
      // fallback doux
      return "bg-[#F8EDE7] text-[#4a002b]";
  }
}


export function getTransition(i: number, j: number): string {
  return `tile-position-${i}-${j}`;
}
