// メッセージテンプレート
import { UnderscoreStatic } from 'underscore';
const _ = require('./lib/underscorejs') as UnderscoreStatic;

export class GSTemplate {
  sheet: GoogleAppsScript.Spreadsheet.Sheet | null;
  constructor(readonly spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet) {
    // メッセージテンプレート設定
    this.sheet = this.spreadsheet.getSheetByName('_メッセージ');
    if (this.sheet) {
      return;
    }
    // sheet がないとき
    this.sheet = this.spreadsheet.insertSheet('_メッセージ');
    if (!this.sheet) {
      throw new Error('エラー: メッセージシートを作れませんでした');
    }
    // const now = DateUtils.now();
    this.sheet.getRange('A1:P2').setValues([
      [
        '出勤',
        '出勤更新',
        '退勤',
        '退勤更新',
        '休憩',
        '休暇',
        '休暇取消',
        '出勤中',
        '出勤なし',
        '休暇中',
        '休暇なし',
        '出勤確認',
        '退勤確認',
        '休憩エラー',
        '退勤と休憩',
        '退勤更新と休憩',
      ],
      [
        '<@#1> Good morning (#2)!',
        '<@#1> I changed starting time to #2',
        '<@#1> Great work! (#2)',
        '<@#1> I changed leaving time to #2',
        '<@#1> I changed break time to #2',
        '<@#1> I registered a holiday for #2',
        '<@#1> I canceled holiday #2',
        '#1 is working',
        'All staffs are working',
        '#2 is having a holiday at #1',
        'No one is having a holiday at #1',
        'Is today holiday? #1',
        'Did you finish working today? #1',
        '[Error] You have not started working today!',
        '<@#1> Great work! I added 60 mins break for you (#2)',
        '<@#1> I changed leaving time to #2 and added 6 mins break for you',
      ],
    ]);
  }
  // テンプレートからメッセージを生成
  template(label: unknown, ...args: any[]) {
    const labels = this.sheet!.getRange('A1:Z1').getValues()[0];
    for (var i = 0; i < labels.length; ++i) {
      if (labels[i] == label) {
        const template = _.sample(
          _.filter(
            _.map(
              this.sheet!.getRange(
                String.fromCharCode(i + 65) + '2:' + String.fromCharCode(i + 65)
              ).getValues(),
              function (v) {
                return v[0];
              }
            ),
            function (v) {
              return !!v;
            }
          )
        );

        let message = template;
        for (let i = 0; i < args.length; i++) {
          let arg = args[i];

          if (_.isArray(arg)) {
            arg = _.map(arg, function (u) {
              return '<@' + u + '>';
            }).join(', ');
          }

          message = message.replace('#' + (i + 1), arg);
        }

        return message;
      }
    }
    return Array.from(arguments).join(', ');
  }
}
