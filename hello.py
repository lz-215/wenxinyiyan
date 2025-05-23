import os
from openai import OpenAI

try:
    client = OpenAI(
        # If environment variable is not set, replace the following line with: api_key="sk-xxx" using your Alibaba Cloud API Key
        api_key=os.getenv("DASHSCOPE_API_KEY"),
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    )

    completion = client.chat.completions.create(
        model="qwen-plus",  # Model list: https://help.aliyun.com/zh/model-studio/getting-started/models
        messages=[
            {'role': 'system', 'content': 'You are a helpful assistant.'},
            {'role': 'user', 'content': 'Who are you?'}
            ]
    )
    print(completion.choices[0].message.content)
except Exception as e:
    print(f"Error message: {e}")
    print("Please refer to documentation: https://help.aliyun.com/zh/model-studio/developer-reference/error-code")