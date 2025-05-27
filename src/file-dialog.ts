import { html } from 'lit';

import './app-file';
import { createRef, ref, Ref } from 'lit/directives/ref.js';

export const fileDialog = () => {
  const dialog : Ref<HTMLDialogElement> = createRef();
  return html`
  <button @click=${()=> dialog.value!.showModal()} >FILE</button>
  <dialog ${ref(dialog)}>
    <app-file></app-file>
  </dialog>
`};