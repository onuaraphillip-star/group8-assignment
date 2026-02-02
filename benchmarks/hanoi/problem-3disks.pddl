(define (problem hanoi-3disks)
  (:domain hanoi)
  (:objects
    d1 d2 d3 - disk
    peg1 peg2 peg3 - peg)
  
  (:init
    ; Disk size ordering: d1 < d2 < d3
    (smaller d1 d2)
    (smaller d1 d3)
    (smaller d2 d3)
    
    ; All pegs are "smaller" than all disks (can place any disk on empty peg)
    (smaller d1 peg1)
    (smaller d1 peg2)
    (smaller d1 peg3)
    (smaller d2 peg1)
    (smaller d2 peg2)
    (smaller d2 peg3)
    (smaller d3 peg1)
    (smaller d3 peg2)
    (smaller d3 peg3)
    
    ; Initial state: all disks on peg1
    (on d1 d2)
    (on d2 d3)
    (on d3 peg1)
    
    ; d1 is on top (clear)
    (clear d1)
    
    ; Other pegs are empty (clear)
    (clear peg2)
    (clear peg3))
  
  (:goal (and
    (on d1 d2)
    (on d2 d3)
    (on d3 peg3)))
)
