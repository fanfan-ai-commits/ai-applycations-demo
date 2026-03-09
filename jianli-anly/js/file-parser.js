/**
 * 文件解析器 - 解析简历文件
 * 支持 PDF、DOCX、TXT 格式
 */
class FileParser {
  constructor() {
    // 文件大小限制 (10MB)
    this.maxFileSize = 10 * 1024 * 1024;
    
    // 初始化PDF.js worker
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }

  /**
   * 解析文件
   * @param {File} file - 文件对象
   * @returns {Promise<string>} - 解析后的文本
   */
  async parse(file) {
    // 检查文件大小
    if (file.size > this.maxFileSize) {
      throw new Error(`文件大小超出限制（最大10MB）`);
    }

    // 获取文件扩展名
    const extension = file.name.split('.').pop().toLowerCase();

    // 根据格式选择解析方法
    switch (extension) {
      case 'pdf':
        return await this.parsePDF(file);
      case 'docx':
        return await this.parseDOCX(file);
      case 'doc':
        return await this.parseDOC(file);
      case 'txt':
        return await this.parseTXT(file);
      default:
        throw new Error(`不支持的文件格式: ${extension}，支持 PDF、DOCX、DOC、TXT`);
    }
  }

  /**
   * 解析PDF文件
   * @param {File} file 
   * @returns {Promise<string>}
   */
  async parsePDF(file) {
    try {
      // 检查是否已加载PDF.js
      if (typeof pdfjsLib === 'undefined') {
        throw new Error('PDF.js库未加载，请刷新页面重试');
      }

      const arrayBuffer = await file.arrayBuffer();
      
      // 加载PDF文档
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      const numPages = pdf.numPages;

      // 逐页提取文本
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // 提取文本并保持格式
        const pageText = textContent.items
          .map(item => item.str)
          .filter(str => str.trim().length > 0)
          .join(' ');
        
        if (pageText.trim()) {
          fullText += pageText + '\n\n';
        }
      }

      // 清理文本
      const cleanedText = this.cleanText(fullText);
      
      if (cleanedText.trim().length < 50) {
        throw new Error('PDF内容提取失败或内容过少，请尝试使用文本型PDF或Word格式');
      }

      return cleanedText;
      
    } catch (error) {
      console.error('PDF解析错误:', error);
      
      if (error.message.includes('PDF.js')) {
        throw error;
      }
      
      throw new Error(`PDF解析失败: ${error.message}。建议将PDF另存为Word格式后重试`);
    }
  }

  /**
   * 解析DOCX文件
   * @param {File} file 
   * @returns {Promise<string>}
   */
  async parseDOCX(file) {
    try {
      // 检查mammoth是否加载
      if (typeof mammoth === 'undefined') {
        // 使用简化的文本提取
        return this.parseDOCXFallback(file);
      }

      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      const cleanedText = this.cleanText(result.value);
      
      if (cleanedText.trim().length < 10) {
        throw new Error('DOCX文件内容为空');
      }

      return cleanedText;
      
    } catch (error) {
      console.error('DOCX解析错误:', error);
      
      // 降级处理
      return this.parseDOCXFallback(file);
    }
  }

  /**
   * DOCX降级解析（使用JSZip直接读取）
   * @param {File} file 
   * @returns {Promise<string>}
   */
  async parseDOCXFallback(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // 尝试使用原生API读取
      // DOCX本质上是一个ZIP文件，包含XML
      const zip = await this.unzip(arrayBuffer);
      
      // 读取word/document.xml
      const textXML = await zip.file('word/document.xml')?.async('string');
      
      if (!textXML) {
        throw new Error('无法读取DOCX文件结构');
      }

      // 解析XML提取文本
      const parser = new DOMParser();
      const doc = parser.parseFromString(textXML, 'text/xml');
      
      // 获取所有文本节点
      const textNodes = doc.getElementsByTagName('w:t');
      let text = '';
      
      for (let i = 0; i < textNodes.length; i++) {
        text += textNodes[i].textContent + ' ';
      }

      return this.cleanText(text);
      
    } catch (error) {
      console.error('DOCX降级解析错误:', error);
      throw new Error('Word文件解析失败，建议另存为DOCX格式或使用PDF格式');
    }
  }

  /**
   * 简单的ZIP解压缩（用于DOCX）
   * @param {ArrayBuffer} data 
   * @returns {Promise<object>}
   */
  async unzip(data) {
    // 简化的ZIP解析
    const files = {};
    const view = new DataView(data);
    let offset = 0;
    
    // 查找文件
    while (offset < view.byteLength) {
      // local file header
      if (view.getUint32(offset) !== 0x04034b50) break;
      
      offset += 4; // signature
      
      // 读取文件头
      const flags = view.getUint16(offset + 6);
      const compression = view.getUint16(offset + 8);
      const nameLen = view.getUint16(offset + 18);
      const extraLen = view.getUint16(offset + 20);
      
      const name = [];
      for (let i = 0; i < nameLen; i++) {
        name.push(String.fromCharCode(view.getUint8(offset + 22 + i)));
      }
      const fileName = name.join('');
      
      offset += 22 + nameLen + extraLen;
      
      // 读取文件数据
      let fileData;
      if (compression === 0) {
        // 不压缩
        const compressedSize = view.getUint32(offset);
        fileData = new Uint8Array(data, offset + 4, compressedSize);
        offset += 4 + compressedSize;
      } else {
        // ZIP64或其他压缩，跳过
        const compressedSize = view.getUint32(offset);
        offset += 4 + compressedSize;
        continue;
      }
      
      // 保存文件
      files[fileName] = {
        async string() {
          return new TextDecoder('utf-8').decode(fileData);
        },
        async buffer() {
          return fileData.buffer;
        }
      };
    }
    
    return {
      file(name) {
        return files[name];
      }
    };
  }

  /**
   * 解析DOC文件（较老的Word格式）
   * @param {File} file 
   * @returns {Promise<string>}
   */
  async parseDOC(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const view = new DataView(arrayBuffer);
      
      // 检测文件类型
      const header = [];
      for (let i = 0; i < 4; i++) {
        header.push(view.getUint8(i));
      }

      // 检查是否是Word文档 (0xD0CF11E0)
      if (header[0] !== 0xD0 || header[1] !== 0xCF || header[2] !== 0x11 || header[3] !== 0xE0) {
        throw new Error('文件格式不正确');
      }

      // DOC格式复杂，建议转换
      throw new Error('.doc格式较老，建议将文件另存为.DOCX或PDF格式后再上传');
      
    } catch (error) {
      console.error('DOC解析错误:', error);
      throw error;
    }
  }

  /**
   * 解析TXT文件
   * @param {File} file 
   * @returns {Promise<string>}
   */
  async parseTXT(file) {
    try {
      // 首先尝试UTF-8
      let text = await file.text();
      
      // 检测是否是乱码（常见于GBK编码）
      if (this.isGarbled(text)) {
        const arrayBuffer = await file.arrayBuffer();
        
        // 尝试GBK
        try {
          const decoder = new TextDecoder('gbk');
          text = decoder.decode(arrayBuffer);
        } catch {
          // 尝试GB18030
          const decoder = new TextDecoder('gb18030');
          text = decoder.decode(arrayBuffer);
        }
      }

      const cleanedText = this.cleanText(text);
      
      if (cleanedText.trim().length < 10) {
        throw new Error('TXT文件内容为空');
      }

      return cleanedText;
      
    } catch (error) {
      console.error('TXT解析错误:', error);
      throw new Error('TXT文件读取失败，请检查文件编码');
    }
  }

  /**
   * 检测是否是乱码
   */
  isGarbled(text) {
    // 乱码通常包含大量方框或无意义字符
    const garbledChars = /[锟絜銊鑶雫锟斤拷]/;
    return garbledChars.test(text) || 
           (text.length > 100 && (text.match(/[^\x00-\x7F]/g) || []).length / text.length > 0.3);
  }

  /**
   * 清理提取的文本
   * @param {string} text 
   * @returns {string}
   */
  cleanText(text) {
    if (!text) return '';
    
    return text
      // 移除多余空白
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \u00A0]{2,}/g, ' ')
      // 移除特殊字符
      .replace(/[^\u4e00-\u9fa5\u0-9a-zA-Z\s\.,\-\_\\/\(\)\（\）\《\》\【\】\:\：\;\；\"\']/g, '')
      .trim();
  }

  /**
   * 提取简历中的关键信息（用于快速预览）
   * @param {string} text 
   * @returns {object}
   */
  extractQuickInfo(text) {
    const info = {
      name: null,
      phone: null,
      email: null,
      education: null,
      experience: null
    };

    // 提取姓名
    const nameMatch = text.match(/^[\s\u4e00-\u9fa5]{2,5}/m);
    if (nameMatch) {
      info.name = nameMatch[0].trim();
    }

    // 提取手机号
    const phoneMatch = text.match(/1[3-9]\d{9}/);
    if (phoneMatch) {
      info.phone = phoneMatch[0];
    }

    // 提取邮箱
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) {
      info.email = emailMatch[0];
    }

    // 提取学历
    const eduKeywords = ['博士', '硕士', '本科', '大专', '中专', '高中', '初中'];
    for (const edu of eduKeywords) {
      if (text.includes(edu)) {
        info.education = edu;
        break;
      }
    }

    // 提取工作经验年限
    const expMatch = text.match(/(\d+)\s*年(以上?)?/);
    if (expMatch) {
      info.experience = parseInt(expMatch[1]);
    }

    return info;
  }
}

// 导出实例
window.fileParser = new FileParser();
