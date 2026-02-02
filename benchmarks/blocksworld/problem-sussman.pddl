(define (problem sussman-anomaly)
  (:domain blocksworld)
  (:objects a b c - block)
  (:init 
    (on a b)
    (ontable b)
    (ontable c)
    (clear a)
    (clear c)
    (handempty))
  (:goal 
    (and (on b a) (on c b)))
)
