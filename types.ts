
export interface PromptSection {
  purpose: string;
  userPerson: string;
  targetCharacter: string;
  interaction: string;
  environment: string;
  lighting: string;
  style: string;
  negative: string;
}

export interface Template {
  id: string;
  title: string;
  imageUrl: string;
  prompt: PromptSection;
  fullPrompt: string;
}

export type ViewType = 'generator' | 'library' | 'analyzer';
