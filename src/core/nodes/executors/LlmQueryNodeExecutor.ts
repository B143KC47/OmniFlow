import { Node } from '../../../types';
import { NodeType } from '../../../types/index';
import { BaseNodeExecutor } from '../BaseNodeExecutor';

/**
 * LLM查询节点执行器
 */
export class LlmQueryNodeExecutor extends BaseNodeExecutor {
  protected readonly nodeType = NodeType.LLM_QUERY;

  /**
   * 实现节点处理逻辑
   * @param node 节点数据
   * @param inputs 节点输入
   */
  protected async processNode(node: Node, inputs: Record<string, any>): Promise<Record<string, any>> {
    const prompt = node.data.inputs?.prompt?.value || inputs.text || '';
    const model = node.data.inputs?.model?.value || inputs.model || 'deepseek-chat';
    const systemPrompt = node.data.inputs?.systemPrompt?.value || inputs.systemPrompt || 'You are a helpful assistant';
    const temperature = node.data.inputs?.temperature?.value || inputs.temperature || 0.7;
    const maxTokens = node.data.inputs?.maxTokens?.value || inputs.maxTokens || 1000;
    const stream = node.data.inputs?.stream?.value === 'true' || inputs.stream === true;
    
    // 使用来自输入的API密钥（通常来自ModelSelectorNode）
    const apiKey = inputs.apiKey || '';

    try {
      // 如果没有API密钥，使用模拟响应
      if (!apiKey) {
        return { text: this.mockLlmCallDeepseek(prompt, model, systemPrompt, temperature, maxTokens, stream) };
      }
      
      // 尝试进行实际的API调用
      const response = await this.callDeepseekAPI(apiKey, prompt, model, systemPrompt, temperature, maxTokens, stream);
      return { text: response };
    } catch (error: unknown) {
      throw new Error(`LLM查询失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 调用DeepSeek API
   */
  private async callDeepseekAPI(
    apiKey: string,
    prompt: string,
    model: string,
    systemPrompt: string,
    temperature: number,
    maxTokens: number,
    stream: boolean
  ): Promise<string> {
    try {
      // 这里应该是对DeepSeek API的实际调用
      // 在浏览器环境中，你应该使用fetch
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { "role": "system", "content": systemPrompt },
            { "role": "user", "content": prompt }
          ],
          temperature: temperature,
          max_tokens: maxTokens,
          stream: stream
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`DeepSeek API错误: ${error.message || response.statusText}`);
      }

      if (stream) {
        // 处理流式响应 - 在实际实现中应该使用正确的流式处理
        return "流式响应已开始。请查看控制台获取消息。";
      } else {
        const data = await response.json();
        return data.choices[0].message.content;
      }
    } catch (error) {
      console.error("DeepSeek API调用失败:", error);
      // 如果API调用失败则回退到模拟响应
      return this.mockLlmCallDeepseek(prompt, model, systemPrompt, temperature, maxTokens, stream);
    }
  }

  /**
   * 模拟DeepSeek LLM调用
   */
  private mockLlmCallDeepseek(
    prompt: string,
    model: string,
    systemPrompt: string,
    temperature: number,
    maxTokens: number,
    stream: boolean
  ): string {
    return `模拟DeepSeek响应：
输入: ${prompt}
系统提示词: ${systemPrompt}
模型: ${model}
温度: ${temperature}
最大Token数: ${maxTokens}
流式输出: ${stream}

注意：这是一个模拟响应。实际使用时，请提供有效的DeepSeek API密钥。
DeepSeek API使用方式:
\`\`\`python
from openai import OpenAI

client = OpenAI(api_key="<DeepSeek API Key>", base_url="https://api.deepseek.com")

response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[
        {"role": "system", "content": "You are a helpful assistant"},
        {"role": "user", "content": "Hello"},
    ],
    stream=False
)

print(response.choices[0].message.content)
\`\`\``;
  }

  /**
   * 获取节点所需的输入
   */
  protected getRequiredInputs(): string[] {
    return ['text']; // LLM查询节点需要文本输入
  }
}