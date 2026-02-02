"""PDDL Domain parser."""
from __future__ import annotations
from pathlib import Path

from ..representations.domain import Domain
from .simple_parser import SimpleDomainParser


class DomainParser:
    """Parser for PDDL domain files."""
    
    def __init__(self):
        self._parser = SimpleDomainParser()
    
    def parse(self, pddl_text: str) -> Domain:
        """Parse PDDL domain text into Domain object."""
        return self._parser.parse(pddl_text)
    
    def parse_file(self, filepath: str | Path) -> Domain:
        """Parse PDDL domain file."""
        text = Path(filepath).read_text()
        return self.parse(text)
