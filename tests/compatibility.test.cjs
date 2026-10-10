const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function load() {
  const fields = new Map();
  const element = id => {
    if (!fields.has(id)) fields.set(id, {
      id, value: '', disabled: false, files: [],
      classList: { add() {}, remove() {}, toggle() {}, contains() { return true; } },
      addEventListener() {}, setAttribute() {}, focus() {}, reset() {},
      querySelector: () => ({ disabled: false }), querySelectorAll: () => []
    });
    return fields.get(id);
  };
  const context = vm.createContext({
    document: { getElementById: element, querySelectorAll: () => [], addEventListener() {} },
    window: { addEventListener() {} }, console
  });
  const code = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8');
  // Startup is exercised in the browser against the simulated API.
  const end = code.lastIndexOf('\ndesenharCamposFormaReceita();');
  vm.runInContext(code.slice(0, end), context);
  return { context, fields, run: code => vm.runInContext(code, context) };
}

test('calculator requires an explicit recipe, including valid index zero', () => {
  const { run, fields } = load();
  run('receitas = [{ ID: "primeira", Rendimento: "8 porções" }];');
  assert.equal(run('obterReceitaCalculadoraSelecionada()'), null);
  fields.get('selectReceitaCalculadora').value = '0';
  assert.equal(run('obterReceitaCalculadoraSelecionada().ID'), 'primeira');
});

test('existing sheet aliases, volumes and quantity conversion still work', () => {
  const { run } = load();
  assert.equal(run('calcularVolumeFormaObjeto(obterFormaReceita({"Tipo Forma":"retangular", "Forma Comprimento":30, "Forma Largura":20, "Forma Altura":5}))'), 3000);
  assert.ok(Math.abs(run('calcularVolumeFormaObjeto({tipo:"redonda",diametro:20,altura:5})') - Math.PI * 500) < 1e-8);
  assert.equal(run('ajustarLinhaIngrediente("200 g de farinha", 2).ajustado'), '400 g de farinha');
  assert.equal(run('ajustarLinhaIngrediente("½ xícara de óleo", 2).ajustado'), '1 xícara de óleo');
  assert.equal(run('ajustarLinhaIngrediente("sal a gosto", 2).ajustado'), 'sal a gosto');
});

test('recipe text remains literal while retaining original line breaks', () => {
  const { run } = load();
  assert.equal(run('formatarTexto("Misture <lentamente> & asse.\\nNão ferver.")'), 'Misture &lt;lentamente&gt; &amp; asse.<br>Não ferver.');
});

test('unsaved work includes dynamic pan dimensions and selected files', () => {
  const { run, fields } = load();
  const controls = [{ id: 'titulo', type: 'text', value: 'Receita' }, { id: 'formaAltura', type: 'number', value: '5' }, { id: 'foto', type: 'file', files: [] }];
  fields.get('formReceita').querySelectorAll = () => controls;
  run('registrarEstadoFormulario()');
  assert.equal(run('formularioAlterado()'), false);
  controls[1].value = '6';
  assert.equal(run('formularioAlterado()'), true);
  controls[1].value = '5';
  controls[2].files = [{ name: 'receita.png', size: 20, lastModified: 1 }];
  assert.equal(run('formularioAlterado()'), true);
});
