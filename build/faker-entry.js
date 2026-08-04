// Entrada de build do bundle de nomes (faker). O esbuild empacota este arquivo,
// junto com os locales necessários do @faker-js/faker, em js/vendor/faker-names.js
// (artefato versionado, consumido pelo app no navegador via import dinâmico).
//
// Cada grupo de idioma (ver js/names.js) recebe uma instância Faker com o locale
// correspondente e fallback para inglês. Para (re)gerar o bundle:
//   npm install && npm run build:names
import {
  Faker,
  pt_BR, en, es, fr, de, it, ru, ar, ja, zh_CN, ko, nl, pl, tr, sv, fa,
} from "@faker-js/faker";

const locales = {
  pt: pt_BR, en, es, fr, de, it, ru, ar, ja, zh: zh_CN, ko, nl, pl, tr, sv, fa,
};

export const fakerByGroup = Object.fromEntries(
  Object.entries(locales).map(([group, locale]) => [group, new Faker({ locale: [locale, en] })]),
);
