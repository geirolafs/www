/**
 * Copy for /localhost/variable-weight — v1's /dev/variable-weight samples,
 * relabelled in this site's type scale. v1 named its sizes after its own CSS
 * variables (`--typography-size-sm` and so on), which mean nothing here.
 */
export const localhostVariableWeightContent = {
  sections: {
    default: { label: "Default", sample: "Hover over me" },
    display: { label: "Display", sample: "Variable Weight" },
    body: { label: "Body", sample: "Variable Weight" },
    meta: { label: "Meta", sample: "Variable Weight" },
    nav: {
      label: "Navigation links",
      links: ["Home", "About", "Contact"],
    },
    layoutShift: {
      label: "Layout shift",
      hint: "The box should not move.",
      sample: "This should not shift",
    },
    duration: { label: "Custom duration", hint: "0.5s", sample: "Slower animation" },
    inline: {
      label: "Inline with text",
      before: "This is regular text with",
      highlight: "highlighted words",
      after: "that animate on hover.",
    },
    arrowLink: {
      label: "Arrow link",
      text: "GitHub",
      href: "https://github.com",
      newTab: "(opens in new tab)",
    },
    copyEmail: {
      label: "Copy email",
      email: "hello@example.com",
      button: "Copy email address",
      title: "click to copy",
      copied: "email copied",
    },
    touch: {
      label: "Touch",
      hint: "On touch devices, tap and hold to trigger the weight change.",
      samples: ["Tap me", "Hold me"],
    },
  },
} as const;
