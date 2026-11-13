const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const isSeparatorRow = (line) =>
  /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());

const getCells = (line) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

export function renderMarkdownTables(markdown) {
  const lines = markdown.split(/\r?\n/);
  const output = [];

  for (let index = 0; index < lines.length; index += 1) {
    if (
      !lines[index].includes("|") ||
      index + 1 >= lines.length ||
      !isSeparatorRow(lines[index + 1])
    ) {
      output.push(lines[index]);
      continue;
    }

    const headers = getCells(lines[index]);
    const rows = [];
    index += 2;

    while (index < lines.length && lines[index].includes("|")) {
      rows.push(getCells(lines[index]));
      index += 1;
    }
    index -= 1;

    const headerHtml = headers
      .map((cell) => `<th>${escapeHtml(cell)}</th>`)
      .join("");
    const bodyHtml = rows
      .map(
        (row) =>
          `<tr>${headers
            .map((_, cellIndex) => `<td>${escapeHtml(row[cellIndex] || "")}</td>`)
            .join("")}</tr>`
      )
      .join("");

    output.push(
      `<table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`
    );
  }

  return output.join("\n");
}
