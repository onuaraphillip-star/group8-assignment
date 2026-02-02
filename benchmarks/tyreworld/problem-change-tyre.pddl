(define (problem change-tyre)
  (:domain tyreworld)
  (:objects
    hub - location
    boot - container
    wrench jack pump - tool
    flat-tyre spare-tyre - wheel
    hub-nut - nut)
  
  (:init
    ; Tools in boot
    (in wrench boot)
    (in jack boot)
    (in pump boot)
    
    ; Spare tyre in boot
    (in spare-tyre boot)
    
    ; Flat tyre on vehicle at hub
    (on-vehicle flat-tyre)
    (flat flat-tyre)
    (at flat-tyre hub)
    
    ; Hub nut is tight
    (tight hub-nut)
    (at hub-nut hub)
    
    ; Spare is inflated
    (inflated spare-tyre))
  
  (:goal (and
    (on-vehicle spare-tyre)
    (tight hub-nut)
    (in flat-tyre boot)
    (in wrench boot)
    (in jack boot)
    (in pump boot)))
)
