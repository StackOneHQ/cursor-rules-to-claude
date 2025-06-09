#!/usr/bin/env node

import { Command } from 'commander';
import { readdir, readFile, writeFile, existsSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { DIVIDERS } from './constants.js';
import { parseFrontmatter } from './frontmatter.js';

const readdirAsync = promisify(readdir);
const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

interface CursorRule {
  description?: string;
  globs?: string;
  alwaysApply?: boolean;
  content: string;
  filename: string;
}

interface Options {
  overwrite: boolean;
  rulesDir: string;
  output: string;
}

const program = new Command();

program
  .name('cursor-rules-to-claude')
  .description('Convert Cursor rules to Claude.md format')
  .version('1.0.0')
  .option('--overwrite', 'overwrite CLAUDE.md instead of appending', false)
  .option('--rules-dir <dir>', 'cursor rules directory', '.cursor/rules')
  .option('--output <file>', 'output file', 'CLAUDE.md')
  .action(async (options: Options) => {
    try {
      await processRules(options);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

const processRules = async (options: Options) => {
  const { overwrite, rulesDir, output } = options;

  if (!existsSync(rulesDir)) {
    console.error(`Rules directory not found: ${rulesDir}`);
    process.exit(1);
  }

  const files = await readdirAsync(rulesDir);
  const ruleFiles = files.filter((file) => file.endsWith('.md') || file.endsWith('.mdc'));

  if (ruleFiles.length === 0) {
    console.log('No .md or .mdc files found in rules directory');
    return;
  }

  const rules: CursorRule[] = [];

  for (const file of ruleFiles) {
    const filePath = join(rulesDir, file);
    const fileContent = await readFileAsync(filePath, 'utf-8');

    const { data: frontmatterData, content } = parseFrontmatter(fileContent);

    rules.push({
      description: frontmatterData.description as string | undefined,
      globs: frontmatterData.globs as string | undefined,
      alwaysApply: Boolean(frontmatterData.alwaysApply),
      content: content,
      filename: file.replace(/\.(md|mdc)$/, ''),
    });
  }

  let claudeContent = '';

  if (!overwrite && existsSync(output)) {
    const existingContent = await readFileAsync(output, 'utf-8');

    // Find where the generated rules section starts and remove it
    const generatedMarker = DIVIDERS.EXTRACTED_RULES;
    const markerIndex = existingContent.indexOf(generatedMarker);

    if (markerIndex !== -1) {
      // Keep only the original content before the generated rules
      claudeContent = `${existingContent.substring(0, markerIndex).trim()}\n\n`;
    } else {
      // No existing generated content, keep all existing content
      claudeContent = `${existingContent.trim()}\n\n`;
    }
  }

  // Build the complete rules section with package info
  let rulesContent = `${DIVIDERS.EXTRACTED_RULES}
${DIVIDERS.GENERATED_BY}

`;

  const alwaysApplyRules = rules.filter((rule) => rule.alwaysApply);
  const conditionalRules = rules.filter((rule) => !rule.alwaysApply && rule.description);
  const noFrontmatterRules = rules.filter(
    (rule) => !rule.alwaysApply && !rule.description
  );

  if (alwaysApplyRules.length > 0) {
    rulesContent += `${DIVIDERS.AUTO_ATTACHED}\n\n`;

    for (const rule of alwaysApplyRules) {
      const title = rule.filename
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      rulesContent += `# ${title}\n\n`;

      if (rule.description) {
        rulesContent += `>${rule.description}\n`;
      }

      rulesContent += `This rule can be found [here](${rulesDir}/${rule.filename}.md)\n\n`;
      rulesContent += `${rule.content}\n\n`;
    }
  }

  if (conditionalRules.length > 0) {
    rulesContent += `${DIVIDERS.CONDITIONAL_RULES}\n\n`;

    for (const rule of conditionalRules) {
      const title = rule.filename
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      rulesContent += `# ${title}\n\n`;

      if (rule.description) {
        rulesContent += `>${rule.description}\n`;
      }

      if (rule.globs) {
        rulesContent += `This refers to: ${rule.globs}\n\n`;
      }

      rulesContent += `Read the full rule [here](${rulesDir}/${rule.filename}.md)\n\n`;
    }
  }

  if (noFrontmatterRules.length > 0) {
    rulesContent += `${DIVIDERS.NO_FRONTMATTER}\n\n`;

    for (const rule of noFrontmatterRules) {
      const title = rule.filename
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      rulesContent += `# ${title}\n\n`;
      rulesContent += `${rule.content}\n\n`;
    }
  }

  // Append the complete rules section to the claude content
  claudeContent += rulesContent;

  await writeFileAsync(output, claudeContent);

  console.log(`✅ Generated ${output} with ${rules.length} rules`);
  console.log(`   - ${alwaysApplyRules.length} always applied rules`);
  console.log(`   - ${conditionalRules.length} conditional rules`);
  console.log(`   - ${noFrontmatterRules.length} rules without frontmatter`);
};

program.parse();
