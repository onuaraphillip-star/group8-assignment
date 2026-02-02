"""PDDL Problem parser."""
from __future__ import annotations
from pathlib import Path
from typing import Dict

from ..representations.state import State
from .simple_parser import SimpleProblemParser


class ProblemParser:
    """Parser for PDDL problem files."""
    
    def __init__(self):
        self._parser = SimpleProblemParser()
    
    def parse(self, pddl_text: str) -> Dict:
        """Parse PDDL problem text into problem data."""
        return self._parser.parse(pddl_text)
    
    def parse_file(self, filepath: str | Path) -> Dict:
        """Parse PDDL problem file."""
        text = Path(filepath).read_text()
        return self.parse(text)

