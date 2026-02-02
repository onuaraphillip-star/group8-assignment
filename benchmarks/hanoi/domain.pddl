(define (domain hanoi)
  (:requirements :strips :typing)
  (:types disk peg - object)
  
  (:predicates
    (on ?disk - disk ?obj - object)
    (clear ?obj - object)
    (smaller ?disk - disk ?obj - object))
  
  (:action move
    :parameters (?disk - disk ?from - object ?to - object)
    :precondition (and 
      (on ?disk ?from)
      (clear ?disk)
      (clear ?to)
      (smaller ?disk ?to))
    :effect (and 
      (on ?disk ?to)
      (clear ?from)
      (not (on ?disk ?from))
      (not (clear ?to))))
)
