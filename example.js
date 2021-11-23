const $ = new Buildable("canvas");
const mod1 = $.createModule();
const mod2 = $.createModule();
mod1.mount(mod2);

const mod3 = $.createModule();