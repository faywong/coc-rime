import {BasicList, ListAction, ListContext, ListItem, Neovim, workspace} from 'coc.nvim'
import {RimeSchema, RimeCLI} from './rime'

export default class SchemaList extends BasicList {
  public readonly name = 'rime_schema';
  public readonly description = 'Schema list of Rime';
  public readonly defaultAction = 'open';
  public schemaList: RimeSchema[] = [];
  public actions: ListAction[] = [];

  private rimeCLI: RimeCLI;

  constructor(nvim: Neovim, rimeCLI: RimeCLI) {
    super(nvim);
    this.rimeCLI = rimeCLI;
    this.addAction('open', (item: ListItem) => {
      this.rimeCLI.setSchema(item.data.schemaId)
      .then((_) => {})
      .catch((e) => {
        console.log(`Error setting the schema: ${e}.`);
        workspace.showMessage(`Set schema ${item.data.label} failed.`);
      });
      this.rimeCLI.getSchema()
      .then((schemaId) => {
        workspace.showMessage(`Changed to schema ${schemaId}.`);
      })
      .catch((e) => {
        console.log(`Error get current schema: ${e}.`);
        workspace.showMessage(`Get current schema failed.`);
      });
    })
  }

  public async loadItems(_context: ListContext): Promise<ListItem[]> {
    return new Promise<ListItem[]>((resolve, _) => {
      this.rimeCLI.getSchemaList()
      .then((res) => {
        let listItems: ListItem[] = res.map(schema => {
          return {
            label: schema.name + ': ' + schema.schemaId,
            filterText: schema.name + schema.schemaId,
            data: schema,
          }
        });
        resolve(listItems)
      });
    });
  }
}
