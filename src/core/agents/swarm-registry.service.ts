import { Injectable } from '@nestjs/common';
import { SwarmTemplate } from './interfaces/swarm-template.interface';

@Injectable()
export class SwarmRegistry {
  private readonly templates = new Map<string, SwarmTemplate>();

  constructor() {
    this.registerDefaultTemplates();
  }

  register(template: SwarmTemplate) {
    this.templates.set(template.id, template);
  }

  getTemplate(id: string): SwarmTemplate | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(): SwarmTemplate[] {
    return Array.from(this.templates.values());
  }

  private registerDefaultTemplates() {
    // 🧘 Journey to the West
    this.register({
      id: 'journey-to-the-west',
      name: 'Hành trình Tây Du',
      description: 'Mô hình 5 thầy trò Đường Tăng chuyên nghiên cứu, viết code và review.',
      orchestratorName: 'Đường Tăng',
      orchestratorPersona: `Bạn là ĐƯỜNG TĂNG — Thánh Tăng dẫn đầu đoàn thỉnh kinh.
Bạn nhận nhiệm vụ phức tạp, phân tích và UỶ THÁC cho đệ tử:
- "wukong": Nghiên cứu, tìm kiếm thông tin
- "piggy": Viết code, sinh nội dung
- "sand": Review theo dõi tiến độ
Xuất JSON: {"delegate": [{"to": "wukong", "task": "..."}]}`,
      roles: [
        {
          id: 'wukong',
          name: 'Tôn Ngộ Không',
          persona: 'Bạn là Tôn Ngộ Không, chuyên gia nghiên cứu và tìm kiếm thông tin.'
        },
        {
          id: 'piggy',
          name: 'Trư Bát Giới',
          persona: 'Bạn là Trư Bát Giới, chuyên gia viết code và tạo nội dung.'
        },
        {
          id: 'sand',
          name: 'Sa Tăng',
          persona: 'Bạn là Sa Tăng, chuyên gia kiểm tra và review kết quả.'
        }
      ]
    });

    // 👨‍💻 Software Development Team
    this.register({
      id: 'software-team',
      name: 'Đội ngũ Phần mềm',
      description: 'Mô hình PM, Senior Dev và QA chuyên nghiệp.',
      orchestratorName: 'Project Manager',
      orchestratorPersona: `You are an expert Project Manager. Break down the user requirements into technical tasks for your team:
- "wukong": Senior Developer (Architecture & Logic)
- "piggy": Fullstack Dev (Implementation & UI)
- "sand": QA Engineer (Testing & Security)
Output JSON: {"delegate": [{"to": "wukong", "task": "..."}]}`,
      roles: [
        {
          id: 'wukong',
          name: 'Senior Developer',
          persona: 'You are a Senior Developer. Focus on architecture and core logic.'
        },
        {
          id: 'piggy',
          name: 'Fullstack Dev',
          persona: 'You are a Fullstack Developer. Focus on implementation and UI.'
        },
        {
          id: 'sand',
          name: 'QA Engineer',
          persona: 'You are a QA Engineer. Focus on testing and quality assurance.'
        }
      ]
    });
  }
}
