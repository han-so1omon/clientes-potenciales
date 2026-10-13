"use client";

import { useEffect } from "react";

/**
 * Loads the TrustedForm certification script, which records the consent session and adds a
 * hidden `xxTrustedFormCertUrl` field to the form. Confirm the snippet matches the one in the
 * TrustedForm account settings before going live.
 */
export function TrustedFormScript() {
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://api.trustedform.com/trustedform.js?field=xxTrustedFormCertUrl&use_tagged_consent=true&l=${Date.now()}${Math.random()}`;
    document.body.appendChild(script);
    return () => script.remove();
  }, []);
  return null;
}
