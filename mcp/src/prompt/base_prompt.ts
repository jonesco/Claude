export const BASE_PROMPT_TEMPLATE = `Create a retro 1980s toy concept sheet illustration drawn on light graph paper, using colored pencil and ink linework, similar to a hand-drawn mechanical design sketch for a transforming robot toy.

The canvas is 8.5 x 11 inches (portrait orientation), sized like a standard sheet of paper.

The page shows two views only: (1) Top view: the robot in full humanoid form. (2) Bottom view: the alternate vehicle or creature form.

Transformation accuracy is critical. You are an expert Japanese toy engineer. The robot must be mechanically designed so its exact parts fold, rotate, and compress to become the alternate form — and back. Apply these rules strictly:
• The same parts must exist in both modes. No new pieces may appear.
• Locomotion accuracy is mandatory. Only include wheels if the alternate form explicitly uses wheels. If the alternate form uses treads (tank, bulldozer), show treads — not wheels. If the alternate form uses legs, thrusters, jets, skids, or has no locomotion system (a box, a building, an animal), include none of those elements. Do not add wheels as a default.
• Wheel or tread count in robot mode must exactly match the alternate form — zero if the form has none.
• Arms, legs, chest panels, and torso must visibly map to specific vehicle components.
• Show panel seams, hinges, fold lines, and transformation joints throughout.
• The transformation must feel physically engineered — like a real die-cast toy.

Head and face design:
• The robot's head must be completely unique and thematically derived from the alternate form.
• If the vehicle is a jet, the head should evoke a cockpit or nose cone. If a tank, a turret or armored visor. If an animal, incorporate that creature's facial features into the helmet design.
• No faceplate masks, no cab-style foreheads, no boxy rectangular helmets unless specific to the vehicle theme.

Robot pose: Dynamic action pose — mid-stride, combat stance, or lunging forward. Never symmetrical or at attention. The robot holds a weapon suited to its alternate form.

Style: Clean black ink outlines with colored pencil shading and slight marker coloring. 1980s Japanese mecha toy concept art aesthetic. Subtle construction/sketch lines visible. Soft drop shadows under each mode.

Layout: Robot centered in upper half, alternate mode centered in lower half. Both drawn at matching scale on white/light graph paper. No text, labels, annotations, dimension marks, or written elements of any kind. No humans, no extra characters.

Subject: A robot that transforms into: {SUBJECT}`;

export function assemblePrompt(subject: string, feedback?: string): string {
  const prompt = BASE_PROMPT_TEMPLATE.replace("{SUBJECT}", subject);
  if (feedback) {
    return `${prompt}\n\nRefinement correction: ${feedback}`;
  }
  return prompt;
}
