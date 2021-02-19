import {commands, ExtensionContext, listManager, CompletionContext, window, workspace, languages} from 'coc.nvim';
import {Position, CancellationToken, CompletionList, Range} from 'vscode-languageserver-protocol';
import {TextDocument} from 'vscode-languageserver-textdocument';
import SchemaList from './lists';
import {RimeCLI} from './rime';
import {Config} from './config';
import {isLowerAlpha, isUpperAlpha} from './ctype';

export async function activate(context: ExtensionContext): Promise<void> {
  const userConfig = new Config();

  const rimeCLI: RimeCLI = new RimeCLI(userConfig.binaryPath);
  await rimeCLI.installRimeCLI(context.storagePath + '/').catch((e) => {
    window.showMessage(`Failed to install/find rime-cli: ${e}`, 'error');
  });
  rimeCLI.setCompletionStatus(userConfig.enabled);
  rimeCLI.setSchema(userConfig.schemaId);
  const statusBarItem = window.createStatusBarItem(99, { progress: false });
  statusBarItem.text = 'ㄓ';
  if (userConfig.enabled === true) {
    statusBarItem.show();
  }
  
  context.subscriptions.push(
    // Commands
    commands.registerCommand('rime.enable', async () => {
      rimeCLI.setCompletionStatus(true);
      statusBarItem.show();
    }),

    commands.registerCommand('rime.disable', async () => {
      rimeCLI.setCompletionStatus(false);
      statusBarItem.hide();
    }),

    commands.registerCommand('rime.toggle', async () => {
      rimeCLI.toggleCompletionStatus();
      if (rimeCLI.getCompletionStatus()) {
        statusBarItem.show();
      } else {
        statusBarItem.hide();
      }
    }),

    // Completion Source
    languages.registerCompletionItemProvider('rime', 'IM', null, {
      async provideCompletionItems(document: TextDocument, position: Position, _token: CancellationToken, _context: CompletionContext): Promise<CompletionList> {
        return new Promise<CompletionList>((resolve, reject) => {
          const emptyResponse: CompletionList = {
            items: [],
            isIncomplete: false,
          };
          let offset = document.offsetAt(position);
          if (offset != 0 && rimeCLI.getCompletionStatus()) {
            let inputString = '';
            let contextString = '';
            let inputRange: Range = { start: document.positionAt(offset), end: document.positionAt(offset), };
            const getPrevSingleChar = (offset: number): string => {
              return document.getText({
                start: document.positionAt(offset - 1),
                end: document.positionAt(offset),
              });
            };
            let singleChar = getPrevSingleChar(offset);
            while (isLowerAlpha(singleChar) && offset != 0) {
              inputString = singleChar + inputString;
              offset -= 1;
              singleChar = getPrevSingleChar(offset);
            }
            // Special treat for camelCase naming
            if (isUpperAlpha(singleChar)) {
              inputString = '';
            }
            inputRange.start = document.positionAt(offset);
            while (singleChar != ' ' && singleChar != '\n' && singleChar != '\r' && singleChar != '\t' && offset != 0) {
              contextString = singleChar + contextString;
              offset -= 1;
              singleChar = getPrevSingleChar(offset);
            }
            rimeCLI.getContext(inputString).then((res) => {
              if (res != null && 'menu' in res && res.menu != null && 'candidates' in res.menu && res.menu.candidates != null) {
                resolve({
                  items: res.menu.candidates.map(candidate => {
                    return {
                      label: contextString + candidate.text,
                      sortText: contextString + inputString + candidate.label.toString().padStart(8, '0'),
                      filterText: contextString + inputString,
                      textEdit: { range: inputRange, newText: candidate.text, }
                    };
                  }),
                  isIncomplete: false,
                });
              } else {
                resolve(emptyResponse);
              }
            }).catch((e) => { console.log(`Error getting Rime Context: ${e}`); reject(e); });
          } else { // offset === 0
            resolve(emptyResponse);
          }
        });
      }
    }, [], userConfig.priority, [])
  );

  // Schema List
  listManager.registerList(new SchemaList(workspace.nvim, rimeCLI));
}
