"""Simple PDDL parser using S-expression parsing."""
from __future__ import annotations
import re
from typing import List, Dict, Tuple, Any, Optional
from ..representations.domain import Domain
from ..representations.action import ActionSchema
from ..representations.state import State


def tokenize(pddl_text: str) -> List[str]:
    """Tokenize PDDL text into tokens."""
    # Remove comments
    lines = pddl_text.split('\n')
    cleaned_lines = []
    for line in lines:
        if ';' in line:
            line = line[:line.index(';')]
        cleaned_lines.append(line)
    text = ' '.join(cleaned_lines)
    
    # Tokenize
    tokens = []
    current = ''
    i = 0
    while i < len(text):
        c = text[i]
        if c in '()':
            if current.strip():
                tokens.append(current.strip())
                current = ''
            tokens.append(c)
        elif c.isspace():
            if current.strip():
                tokens.append(current.strip())
                current = ''
        else:
            current += c
        i += 1
    if current.strip():
        tokens.append(current.strip())
    return tokens


def parse_sexpr(tokens: List[str], pos: int = 0) -> Tuple[Any, int]:
    """Parse S-expression from tokens."""
    if pos >= len(tokens):
        return None, pos
    
    if tokens[pos] == '(':
        pos += 1
        elements = []
        while pos < len(tokens) and tokens[pos] != ')':
            elem, pos = parse_sexpr(tokens, pos)
            elements.append(elem)
        if pos < len(tokens) and tokens[pos] == ')':
            pos += 1
        return elements, pos
    else:
        return tokens[pos], pos + 1


def parse_typed_list(items: List[str]) -> List[Tuple[str, str]]:
    """Parse a typed list like ['a', 'b', '-', 'block', 'c', '-', 'ball']."""
    result = []
    current_names = []
    i = 0
    while i < len(items):
        if items[i] == '-':
            type_name = items[i + 1] if i + 1 < len(items) else 'object'
            for name in current_names:
                result.append((name, type_name))
            current_names = []
            i += 2
        else:
            current_names.append(items[i])
            i += 1
    # Add remaining with default type
    for name in current_names:
        result.append((name, 'object'))
    return result


def parse_formula(expr: Any) -> List[Tuple[str, Tuple[str, ...]]]:
    """Parse a formula into list of (predicate, args)."""
    result = []
    if isinstance(expr, list):
        if not expr:
            return result
        op = expr[0]
        if op == 'and':
            for sub in expr[1:]:
                result.extend(parse_formula(sub))
        elif op == 'not':
            # Skip negative preconditions for now
            pass
        elif op == '=':
            # Skip equality
            pass
        else:
            # Atomic formula
            args = tuple(str(a) for a in expr[1:]) if len(expr) > 1 else ()
            result.append((op, args))
    return result


def parse_effect(expr: Any) -> Tuple[List, List]:
    """Parse effect formula into (add_effects, del_effects)."""
    add_effects = []
    del_effects = []
    
    if isinstance(expr, list):
        if not expr:
            return add_effects, del_effects
        op = expr[0]
        if op == 'and':
            for sub in expr[1:]:
                sub_add, sub_del = parse_effect(sub)
                add_effects.extend(sub_add)
                del_effects.extend(sub_del)
        elif op == 'not':
            # Delete effect
            inner = expr[1]
            if isinstance(inner, list):
                pred_name = inner[0]
                args = tuple(str(a) for a in inner[1:]) if len(inner) > 1 else ()
                del_effects.append((pred_name, args))
        else:
            # Add effect
            pred_name = expr[0]
            args = tuple(str(a) for a in expr[1:]) if len(expr) > 1 else ()
            add_effects.append((pred_name, args))
    
    return add_effects, del_effects


class SimpleDomainParser:
    """Simple PDDL domain parser."""
    
    def parse(self, pddl_text: str) -> Domain:
        """Parse PDDL domain text."""
        tokens = tokenize(pddl_text)
        ast, _ = parse_sexpr(tokens)
        
        if not isinstance(ast, list) or ast[0] != 'define':
            raise ValueError("Invalid domain: expected (define ...)")
        
        # Get domain name
        domain_name = None
        body_start = 2
        if isinstance(ast[1], list) and ast[1][0] == 'domain':
            domain_name = ast[1][1]
        
        domain = Domain(name=domain_name or 'unknown')
        
        # Parse body elements
        i = body_start
        while i < len(ast):
            elem = ast[i]
            if isinstance(elem, list):
                keyword = elem[0]
                if keyword == ':requirements':
                    domain.requirements = elem[1:]
                elif keyword == ':types':
                    # Parse typed list like: disk peg - object
                    typed = parse_typed_list(elem[1:])
                    for type_name, parent_type in typed:
                        domain.types[type_name] = parent_type
                elif keyword == ':constants':
                    typed = parse_typed_list(elem[1:])
                    for name, type_name in typed:
                        domain.constants[name] = type_name
                elif keyword == ':predicates':
                    for pred_def in elem[1:]:
                        if isinstance(pred_def, list):
                            pred_name = pred_def[0]
                            typed = parse_typed_list(pred_def[1:])
                            domain.predicates[pred_name] = [t for _, t in typed]
                elif keyword == ':action':
                    action = self._parse_action(elem)
                    domain.action_schemas[action.name] = action
            i += 1
        
        return domain
    
    def _parse_action(self, elem: List) -> ActionSchema:
        """Parse action definition."""
        action_name = elem[1]
        parameters = []
        preconditions = []
        add_effects = []
        del_effects = []
        
        i = 2
        while i < len(elem):
            if elem[i] == ':parameters':
                i += 1
                if i < len(elem) and isinstance(elem[i], list):
                    typed = parse_typed_list(elem[i])
                    parameters = typed
            elif elem[i] == ':precondition':
                i += 1
                if i < len(elem):
                    preconditions = parse_formula(elem[i])
            elif elem[i] == ':effect':
                i += 1
                if i < len(elem):
                    add_effects, del_effects = parse_effect(elem[i])
            i += 1
        
        return ActionSchema(
            name=action_name,
            parameters=parameters,
            preconditions=preconditions,
            add_effects=add_effects,
            del_effects=del_effects
        )


class SimpleProblemParser:
    """Simple PDDL problem parser."""
    
    def parse(self, pddl_text: str) -> Dict:
        """Parse PDDL problem text."""
        tokens = tokenize(pddl_text)
        ast, _ = parse_sexpr(tokens)
        
        if not isinstance(ast, list) or ast[0] != 'define':
            raise ValueError("Invalid problem: expected (define ...)")
        
        result = {
            'name': 'unknown',
            'domain_name': '',
            'objects': {},
            'initial_state': State(),
            'goal': set()
        }
        
        # Get problem name
        if isinstance(ast[1], list) and ast[1][0] == 'problem':
            result['name'] = ast[1][1]
        
        # Parse body
        i = 2
        while i < len(ast):
            elem = ast[i]
            if isinstance(elem, list):
                keyword = elem[0]
                if keyword == ':domain':
                    result['domain_name'] = elem[1]
                elif keyword == ':objects':
                    typed = parse_typed_list(elem[1:])
                    for name, type_name in typed:
                        result['objects'][name] = type_name
                elif keyword == ':init':
                    initial_preds = set()
                    for pred_def in elem[1:]:
                        if isinstance(pred_def, list):
                            pred_name = pred_def[0]
                            args = [str(a) for a in pred_def[1:]]
                            if args:
                                initial_preds.add(f"{pred_name}({','.join(args)})")
                            else:
                                initial_preds.add(pred_name)
                    result['initial_state'] = State(initial_preds)
                elif keyword == ':goal':
                    goal_preds = parse_formula(elem[1])
                    result['goal'] = set()
                    for pred_name, args in goal_preds:
                        if args:
                            result['goal'].add(f"{pred_name}({','.join(args)})")
                        else:
                            result['goal'].add(pred_name)
            i += 1
        
        return result
