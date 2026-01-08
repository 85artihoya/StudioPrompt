
import { PromptSection, Template } from './types';

export const EXAMPLE_PROMPT: PromptSection = {
  purpose: "A photorealistic, candid, behind-the-scenes (BTS) long shot selfie, taken on a film set.",
  userPerson: "The person from the Character Reference Image, maintaining their real face, body, hairstyle, and proportions.",
  targetCharacter: "[Al Pacino] as [Tony Montana], depicted as a young man in his late 30s, wearing his iconic signature suit.",
  interaction: "Both are posing naturally and casually for the selfie, standing directly next to each other.",
  environment: "The background reflects the iconic set from [Tony Montana's Mansion].",
  lighting: "Natural, slightly hot lighting, with cinematic softness.",
  style: "Photorealistic, high-detail, genuine behind-the-scenes photo.",
  negative: "Not stylized, not painted, not concept art, no fantasy elements, no text overlays."
};

export const EMPTY_PROMPT: PromptSection = {
  purpose: "",
  userPerson: "",
  targetCharacter: "",
  interaction: "",
  environment: "",
  lighting: "",
  style: "",
  negative: ""
};

export const KEYWORD_PRESETS: Record<keyof PromptSection, string[]> = {
  purpose: [
    "Wide-angle selfie", "POV shot", "Close-up selfie", "Mirror selfie", "Arm-length shot", "Fisheye selfie", "Group selfie",
    "Rule of thirds", "Centered", "Dutch angle", "Eye-level", "Low-angle", "High-angle",
    "Candid shot", "Spontaneous moment", "Handheld camera shake", "Grainy film", "Raw photo",
    "Behind-the-scenes footage", "Film set photography", "Production still", "Making-of", "Unposed"
  ],
  environment: [
    "Soundstage", "Movie lot", "Location scouting", "Green screen", "Scaffolding", "Backstage",
    "Industrial warehouse", "Luxury penthouse", "Futuristic cockpit", "Medieval dungeon", "Ancient temple", "Deep forest", "Neon-lit city",
    "Camera rig", "Tripod", "Lighting stands", "Boom microphone", "Clapperboard", "Director's chair"
  ],
  userPerson: [
    "Strict identity preservation", "Zero facial modification", "Exact pixel-perfect match", "Unaltered skin texture",
    "Maintaining facial proportions", "No beauty filters", "Zero AI distortion", "True-to-life representation",
    "Original hair color", "Authentic height", "Individual moles/freckles", "Natural body shape"
  ],
  targetCharacter: [
    "In their prime", "Young version", "Aged version", "Wearing prosthetic makeup",
    "Iconic outfit", "Battle-scarred", "Covered in dust", "Formal tuxedo", "Period costume", "Tattered clothes", "High-fashion armor",
    "Smirking", "Intense gaze", "Winking", "Laughing out loud", "Stern expression", "Charismatic", "Villainous grin", "Heroic look"
  ],
  interaction: [
    "Arm around shoulder", "Hand on shoulder", "Back-to-back", "Shaking hands", "High-fiving", "Hugging", "Fist bump",
    "Leaning against a wall", "Holding a coffee cup", "Checking the phone", "Pointing at something", "Peace sign (V)", "Thumbs up", "Toasting",
    "Professional chemistry", "Friendly bond", "Rivalry vibe", "Mentor and protégé", "Comedic duo"
  ],
  lighting: [
    "Natural sunlight", "Harsh desert sun", "Soft diffused daylight", "Golden hour", "Blue hour", "Rim lighting", "Backlit", "Cinematic lighting",
    "Volumetric lighting", "Neon glow", "High-key lighting", "Low-key lighting", "Chiaroscuro",
    "Hazy", "Foggy", "Dusty atmosphere", "Rain-soaked", "Lens flare", "Soft bokeh"
  ],
  style: [
    "Photorealistic", "Hyper-realistic", "8k UHD", "Shot on 35mm film", "Shot on iPhone 15 Pro", "Detailed pores", "Sharp focus"
  ],
  negative: [
    "CGI", "3D render", "Cartoon", "Anime", "Oil painting", "Concept art", "Illustration", "Digital art", "Sketch", "Watermark", "Logo", "Text", "Signature",
    "Deformed hands", "Extra fingers", "Blurred face", "Plastic skin", "Oversaturated", "Bad anatomy", "Double heads", "Low resolution"
  ]
};

export const MOCK_TEMPLATES: Template[] = [
  {
    id: '1',
    title: '스카페이스(Scarface) BTS',
    imageUrl: 'https://images.unsplash.com/photo-1598449356475-b9f71db7d847?q=80&w=800&auto=format&fit=crop',
    prompt: EXAMPLE_PROMPT,
    fullPrompt: "A photorealistic, candid, behind-the-scenes (BTS) long shot selfie..."
  },
  {
    id: '2',
    title: '다크 나이트(Dark Knight) BTS',
    imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=800&auto=format&fit=crop',
    prompt: {
      ...EXAMPLE_PROMPT,
      targetCharacter: "[Christian Bale] as [Batman], breaking character slightly with a grin.",
      environment: "A dark, wet alleyway in Gotham."
    },
    fullPrompt: "A gritty, cinematic BTS shot of Batman in Gotham..."
  }
];
