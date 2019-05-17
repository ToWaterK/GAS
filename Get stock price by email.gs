/*受信トレイで受信したメールの件名が株価でかつ未読の場合、
文面の銘柄コードで株探（もしくはヤフーファイナンス）の株価データをスクレイピングして
現在の時間、時間毎の挨拶、銘柄コード、銘柄名、株価でメール文章を作成し、
メールを送って来たアドレスに返信する。
実際の使用にはトリガーを設定することが必要（5分毎に起動等）
受信メールformat　件名＝株価、文章＝銘柄コードのみ（例：1951）
*/
function myFunction() {
  var now = new Date();
  var hour = now.getHours();
  var query = '(in:inbox is:unread "株価取得”)';　//条件　受信トレイ、未読、キーワード株価取得
  var threads = GmailApp.search(query, 0, 10);　//検索結果の0番目から10個のスレッドを格納
  var messages = GmailApp.getMessagesForThreads(threads); //2次元配列にスレッド毎のメッセージを格納

  for(var i=0; i < messages.length; i++) {　//2次元配列　行番号
    for(var j=0; j < messages[i].length; j++) {　//2次元配列　列番号
     
      var from = messages[i][j].getFrom();　//メールから送信者を抜き出す
      var subject = "株価　" + Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd/HH:mm:ss');　//返信メールの件名作成
　　         
      var code = messages[i][j].getPlainBody().replace(/\r?\n/g,"");//メールから文章（銘柄コード）を抜きだす
      //replaceで文字列の改行を削除しないとUrlFetchappで無効な引数になる

      var body = '';　//bodyを初期化
         
      //var url = "https://stocks.finance.yahoo.co.jp/stocks/detail/?code="+ code;
      var url = "https://kabutan.jp/stock/?code="+ code;　//文章から取り出した銘柄コードとスクレイピングするURLを結合
      var response = UrlFetchApp.fetch(url); //URL先からデータを取得
    
      //var searchTag = /<h1>([\s\S]*?)<\/h1>/i;
      var searchTag = /<h3>([\s\S]*?)<\/h3>/i;　//データを検索する文字列（銘柄名）
      var match = searchTag.exec(response.getContentText());　//データ内を検索　
      var meigara = match[1]　//検索結果から銘柄名を格納
      
      //var searchTag = /<td class="stoksPrice">([\s\S]*?)<\/td>/i;
      var searchTag = /<span class="kabuka">([\s\S]*?)<\/span>/i;　//（株価）
      var match = searchTag.exec(response.getContentText());
      var kabuka = match[1] //検索結果から株価を格納
      
      body += "TO: " + from + " 様" + '\n\n';　//文面　返信先アドレス名
      body += timefrase(hour) + ' \n\n';　//文面　返信時間毎のメッセージ
      body += Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd/HH:mm:ss') + '　現在\n\n';　//文面　返信時間
      body += code + "  " + meigara + "  " + kabuka + '\n\n';　//文面　銘柄コード　銘柄名　株価
      body += "以上"　//文面
      
      //GmailApp.createDraft(from, subject, body);
      GmailApp.sendEmail(from, subject, body);　//メールを作成して送付
      messages[i][j].markRead();　//処理を終了したメールを既読にする
    }
  }
}

function timefrase(hour){ // 独自関数
  if(hour >= 5 && hour <= 8){　// 5時から8時のメッセージ
    var frase = 'おはようございます。';
  }
  else if(hour >= 9 && hour <= 11){　//9時から11時のメッセージ
    var frase = '頑張っていきましょう。';
  }
  else if(hour >= 12 && hour <= 13){　//12時から13時のメッセージ
    var frase = '腹減ったパケラッタ。';
  }
  else if(hour >= 14 && hour <= 17){　//14時から17時のメッセージ
    var frase = '今日は早く帰れるかなぁ？';
  }
  else if(hour >= 18 && hour <= 23){　//18時から23時のメッセージ
    var frase = 'まだ仕事ですか？';
  }
  else{　//24時から5時までのメッセージ
    var frase = 'そろそろ寝てくださいネ';
  }
  return frase
}