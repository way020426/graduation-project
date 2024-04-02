import json
import re
import sys
import docx

def process_docx(file_path):
    doc = docx.Document(file_path)
    questions = []

    for para in doc.paragraphs:
        # 假设每个问题都以数字和点开头，例如 "1. 这是一个问题"
        if re.match(r"\d+\.", para.text):
            questions.append({
                "question": para.text,
                "options": []
            })
        elif re.match(r"[A-D]\.", para.text):
            # 假设每个选项都以字母和点开头，例如 "A. 选项一"
            if questions:
                questions[-1]["options"].append(para.text)

    return questions

if __name__ == "__main__":
    file_path = sys.argv[1]
    questions = process_docx(file_path)
    print(json.dumps(questions, ensure_ascii=False))  # 输出 JSON 字符串
