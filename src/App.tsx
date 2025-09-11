import './App.css';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import gong from './audio/gong.mp3';

function App() {
  const [roundLength, setRoundLength] = useState({ minutes: 1, seconds: 30 });
  const [rest, setRest] = useState({ minutes: 0, seconds: 30 });
  const [activeTimer, setActiveTimer] = useState<'round' | 'rest' | null>(null);
  const [rounds, setRounds] = useState('3');
  const [isAccepted, setIsAccepted] = useState(false);
  const gongRef = useRef<HTMLAudioElement | null>(null);
  const presetRef = useRef({
    roundLength: roundLength,
    rest: rest,
    rounds: rounds,
  });
  const roundMinutesToShow =
    roundLength.minutes < 10 ? `0${roundLength.minutes}` : roundLength.minutes;
  const restMinutesToShow =
    rest.minutes < 10 ? `0${rest.minutes}` : rest.minutes;

  const roundSecondsToShow =
    roundLength.seconds < 10 ? `0${roundLength.seconds}` : roundLength.seconds;
  const restSecondsToShow =
    rest.seconds < 10 ? `0${rest.seconds}` : rest.seconds;

  const roundLengthHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setRoundLength(prev => {
      return {
        ...prev,
        [name]: Number(value.slice(0, 2)),
      };
    });
  };

  const restLengthHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setRest(prev => {
      return {
        ...prev,
        [name]: Number(value.slice(0, 2)),
      };
    });
  };

  const acceptHandler = () => {
    presetRef.current = {
      roundLength: roundLength,
      rest: rest,
      rounds: rounds,
    };
    setIsAccepted(true);
  };

  useEffect(() => {
    if (activeTimer && gongRef?.current) gongRef?.current?.play();
  }, [activeTimer, gongRef?.current]);

  useEffect(() => {
    if (isAccepted) {
      if ((rest.minutes || rest.seconds) && Number(rounds) > 0) {
        setActiveTimer('rest');
        const restTimer = setTimeout(() => {
          if (rest.seconds > 0) {
            setRest(prev => {
              return {
                ...prev,

                seconds: prev.seconds - 1,
              };
            });
          } else {
            setRest(prev => {
              return {
                seconds: 60,
                minutes: prev.minutes - 1,
              };
            });
          }
        }, 1000);
        return () => clearTimeout(restTimer);
      } else if (
        !rest.minutes &&
        !rest.seconds &&
        rounds &&
        (roundLength.minutes > 0 || roundLength.seconds > 0)
      ) {
        setActiveTimer('round');
        const roundTimer = setTimeout(() => {
          if (roundLength.seconds > 0) {
            setRoundLength(prev => {
              return {
                ...prev,

                seconds: prev.seconds - 1,
              };
            });
          } else {
            setRoundLength(prev => {
              return {
                seconds: 60,
                minutes: prev.minutes - 1,
              };
            });
          }
        }, 1000);
        return () => {
          clearTimeout(roundTimer);
        };
      } else if (
        !roundLength.minutes &&
        !roundLength.seconds &&
        !roundLength.minutes &&
        !roundLength.seconds &&
        rounds
      ) {
        setRounds(prev => String(Number(prev) - 1));
        setRoundLength(presetRef?.current.roundLength);
        setRest(presetRef?.current.rest);
      } else {
        setIsAccepted(false);
        setActiveTimer(null);

        setRounds(presetRef.current.rounds);
      }
    }
  }, [isAccepted, roundLength, rest, rounds]);

  return (
    <div className="h-screen bg-gray-600 flex justify-center flex-col items-center p-5">
      <div className="flex gap-5 flex-col w-[300px] ">
        <audio src={gong} ref={gongRef}></audio>
        <Card
          className={`p-5 ${
            activeTimer === 'round' || !activeTimer
              ? 'bg-green-400'
              : 'bg-amber-400'
          } flex flex-col justify-center`}>
          <p className="text-center text-white ">
            {activeTimer === 'round' ? `Раунд ${rounds}:` : ''}
            {activeTimer === 'rest' ? 'Подготовка:' : ''}
            {!activeTimer ? 'Таймер:' : ''}
          </p>
          <div className="flex justify-center text-white text-7xl font-bold">
            <p>
              {activeTimer === 'round' || !activeTimer
                ? roundMinutesToShow
                : restMinutesToShow}
            </p>
            :
            <p>
              {activeTimer === 'round' || !activeTimer
                ? roundSecondsToShow
                : restSecondsToShow}
            </p>
          </div>
        </Card>
        <Card className="p-5 bg-white">
          {!isAccepted ? (
            <>
              <div className="flex gap-1 flex-col w-full">
                <Label>Подготовка</Label>
                <div className="flex gap-2">
                  <Input
                    value={rest.minutes}
                    type="number"
                    placeholder="Минуты"
                    name="minutes"
                    onChange={restLengthHandler}
                  />
                  <Input
                    value={rest.seconds}
                    type="number"
                    placeholder="Секунды"
                    name="seconds"
                    onChange={restLengthHandler}
                  />
                </div>
              </div>
              <div className="flex gap-1 flex-col w-full">
                <Label>Длина раунда</Label>
                <div className="flex gap-2">
                  <Input
                    max={3}
                    maxLength={3}
                    value={roundLength.minutes}
                    type="number"
                    placeholder="Минуты"
                    name="minutes"
                    onChange={roundLengthHandler}
                  />
                  <Input
                    value={roundLength.seconds}
                    type="number"
                    placeholder="Секунды"
                    name="seconds"
                    onChange={roundLengthHandler}
                  />
                </div>
              </div>

              <div className="flex gap-5 justify-between items-end">
                <div className="flex gap-1 flex-col">
                  <Label>Количество раундов</Label>
                  <Input
                    type="number"
                    placeholder="Количество раундов"
                    value={rounds}
                    onChange={e => setRounds(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  className="bg-white"
                  disabled={isAccepted}
                  onClick={acceptHandler}>
                  Применить
                </Button>
              </div>
            </>
          ) : (
            <Button
              variant="outline"
              className="bg-white"
              onClick={() => setIsAccepted(false)}>
              Пауза
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}

export default App;
