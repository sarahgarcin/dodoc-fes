#!/bin/bash
# set -x

# settings

printer=Canon_LBP7100C_7110C                    # labos
archivebox="archivebox/"
printinbox="printbox/"
interval=3

# main loop
mkdir $archivebox $printinbox

while true; do

  for step in `find $printinbox -iname "*.pdf" -type f`
  do 
    lpr -P $printer -o media=A4 -o fit-to-page $step
    mv -v $step $archivebox # copy in outbox (archives)
  done

  # wait
  for (( i=$interval; i>0; i--)); do
    sleep 1 &
    printf "next try in $i s \r"
    wait
    printf "                   \r"
  done
done