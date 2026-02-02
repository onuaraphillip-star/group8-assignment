(define (problem 3blocks)
  (:domain blocksworld)
  (:objects a b c - block)
  (:init 
    (on a b)
    (on b c)
    (ontable c)
    (clear a)
    (handempty))
  (:goal 
    (and (on c b) (on b a)))
)
