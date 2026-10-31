"use client";

import { startTransition, type FormEvent } from "react";

// React resets a form after its `action` runs, which would wipe what someone typed whenever the
// server answers with an error. Submitting through onSubmit keeps the values; the `action` prop
// stays on the form so it still works before hydration and without JavaScript.
export function useKeepValuesSubmit(formAction: (formData: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  };
}
