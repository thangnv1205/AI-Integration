export interface CommandGroup {
  id: string;          // e.g., 'code-review-flow'
  name: string;
  description: string;
  steps: string[];     // Array of tasks/prompts to run sequentially
}
