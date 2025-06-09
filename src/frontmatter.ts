export interface FrontmatterResult {
  data: Record<string, string | boolean>;
  content: string;
}

export const parseFrontmatter = (fileContent: string): FrontmatterResult => {
  const lines = fileContent.split('\n');
  const frontmatterData: Record<string, string | boolean> = {};
  let content = fileContent;

  // Check if file starts with frontmatter
  if (lines[0]?.trim() === '---') {
    let frontmatterEnd = -1;

    // Find the closing ---
    for (let i = 1; i < lines.length; i++) {
      if (lines[i]?.trim() === '---') {
        frontmatterEnd = i;
        break;
      }
    }

    if (frontmatterEnd > 0) {
      // Parse frontmatter lines
      for (let i = 1; i < frontmatterEnd; i++) {
        const line = lines[i]?.trim();
        if (line?.includes(':')) {
          const colonIndex = line.indexOf(':');
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();

          if (value === 'true') {
            frontmatterData[key] = true;
          } else if (value === 'false') {
            frontmatterData[key] = false;
          } else if (value) {
            frontmatterData[key] = value;
          }
        }
      }

      // Extract content after frontmatter
      content = lines
        .slice(frontmatterEnd + 1)
        .join('\n')
        .trim();
    }
  }

  return {
    data: frontmatterData,
    content,
  };
};
