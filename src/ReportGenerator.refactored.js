const ADMIN_PRIORITY_THRESHOLD = 1000;
const USER_VALUE_LIMIT = 500;

export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  _generateReportHeader(reportType, user) {
    if (reportType === 'CSV') {
      return 'ID,NOME,VALOR,USUARIO\n';
    } else if (reportType === 'HTML') {
      return '<html><body>\n' +
             '<h1>Relatório</h1>\n' +
             `<h2>Usuário: ${user.name}</h2>\n` +
             '<table>\n' +
             '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n';
    }
    return '';
  }

  _generateReportFooter(reportType, total) {
    if (reportType === 'CSV') {
      return '\nTotal,,\n' + `${total},,\n`;
    } else if (reportType === 'HTML') {
      return '</table>\n' +
             `<h3>Total: ${total}</h3>\n` +
             '</body></html>\n';
    }
    return '';
  }

  _formatItemCSV(item, userName) {
    return `${item.id},${item.name},${item.value},${userName}\n`;
  }

  _formatItemHTML(item, isHighPriority = false) {
    const style = isHighPriority ? ' style="font-weight:bold;"' : '';
    return `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
  }

  _processItem(item, reportType, user) {
    if (reportType === 'CSV') {
      return this._formatItemCSV(item, user.name);
    } else if (reportType === 'HTML') {
      const isHighPriority = item.priority || false;
      return this._formatItemHTML(item, isHighPriority);
    }
    return '';
  }

  /**
   * Gera um relatório de itens baseado no tipo e no usuário.
   * - Admins veem tudo.
   * - Users comuns só veem itens com valor <= 500.
   */
  generateReport(reportType, user, items) {
    let report = '';
    let total = 0;

    // --- Seção do Cabeçalho ---
    report += this._generateReportHeader(reportType, user);

    // --- Seção do Corpo ---
    for (const item of items) {
      if (user.role === 'ADMIN') {
        // Admins veem todos os itens
        if (item.value > ADMIN_PRIORITY_THRESHOLD) {
          item.priority = true;
        }
        report += this._processItem(item, reportType, user);
        total += item.value;
      } else if (user.role === 'USER' && item.value <= USER_VALUE_LIMIT) {
        // Users comuns só veem itens de valor baixo
        report += this._processItem(item, reportType, user);
        total += item.value;
      }
    }

    // --- Seção do Rodapé ---
    report += this._generateReportFooter(reportType, total);

    return report.trim();
  }
}