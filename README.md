# PlanLab - Classical Planning Workbench

[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

PlanLab is an interactive educational platform for learning classical AI planning algorithms. It combines a powerful planning engine with intuitive visualizations, enabling students and researchers to understand, implement, and experiment with planning concepts.

![PlanLab Screenshot](docs/screenshot.png)

## 🌟 Features

- **Interactive PDDL Editor** - Write planning domains with syntax highlighting
- **Algorithm Visualization** - Step-by-step visualization of BFS, DFS, A*, and Greedy search
- **Plan Animation** - Visual execution in Blocksworld, Gripper, Hanoi, and TyreWorld domains
- **Educational Module** - 6-lesson curriculum with quizzes and progress tracking
- **Plan Comparison** - Side-by-side analysis of different algorithms
- **User Management** - Authentication with persistent progress

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/planlab.git
   cd planlab
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd /home/israel/Desktop/group8
python -m uvicorn src.main:app --reload --port 8001
```

**Terminal 2 - Frontend:**
```bash
cd /home/israel/Desktop/group8/frontend
npm run dev
```

**Access the app:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8001
- API Documentation: http://localhost:8001/docs

## 📚 Documentation

- [User Guide](docs/USER_GUIDE.md) - Complete guide for using PlanLab
- [Technical Report](docs/TECHNICAL_REPORT.md) - System architecture and implementation details
- [API Reference](http://localhost:8001/docs) - Interactive API documentation

## 🏗️ Project Structure

```
planlab/
├── data/                  # SQLite database
├── src/                   # Python backend
│   ├── planners/          # Search algorithms
│   ├── domains/           # Domain implementations
│   ├── animations/        # Animation systems
│   └── main.py           # FastAPI entry point
├── frontend/              # React frontend
│   ├── src/components/    # React components
│   ├── src/pages/         # Page components
│   └── src/hooks/         # Custom hooks
├── benchmarks/            # PDDL benchmark problems
└── docs/                  # Documentation
```

## 🧪 Running Tests

**Backend tests:**
```bash
pytest
```

**Frontend tests:**
```bash
cd frontend
npm test
```

## 🐳 Docker Deployment

```bash
docker build -t planlab .
docker run -p 8001:8001 -p 5173:5173 planlab
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- The planning community for PDDL and benchmark problems
- FastAPI and React teams for excellent frameworks
- Contributors and testers

## 📧 Contact

For questions or support, please open an issue or contact us at support@planlab.dev

---

**Happy Planning! 🧠✨**
# group8-assignment
