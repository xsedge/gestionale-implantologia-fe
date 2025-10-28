import { createPinia } from "pinia";

export const pinia = createPinia();

export { useClientiStore } from "./ClientiStore.js";
export { useOrdiniStore } from "./OrdineStore.js";
export { useProdottiStore } from "./ProdottiStore.js";
export { useServiziStore } from "./ServiziStore.js";
export { useMagazzinoStore } from "./MagazzinoStore.js";