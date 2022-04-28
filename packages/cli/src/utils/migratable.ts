export interface Migratable<To = Record<string, any>> {
  migrate: (entity: To) => any;

  setup: () => any;

  done: () => any;
}
