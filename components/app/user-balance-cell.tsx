import { FC } from 'react';

export interface SerializableAiBalance {
  /** Купленные и ещё не истраченные баллы. */
  balance: number;
  /** Сколько звёзд человек занёс за всё время. */
  stars: number;
  /** Сколько раз платил. */
  purchases: number;
}

interface IUserBalanceCellProps {
  balance: SerializableAiBalance | null;
}

// Купленное — отдельный карман от бесплатной квоты: тратится он только когда
// окно лимита уже забито, и не сгорает. Поэтому и показывается отдельной
// графой, а не прибавкой к лимиту — иначе по одной цифре не понять, почему
// человек генерирует, хотя лимит исчерпан.
//
// Платежи сворачиваем в ЗВЁЗДЫ, а не в сумму купленных баллов: цена пачки
// менялась (24.10.2026), и сумма баллов сложила бы в одно число разные
// единицы. Звезда значит одно и то же всегда.
export const UserBalanceCell: FC<IUserBalanceCellProps> = ({ balance }) => {
  if (!balance) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      <span>{balance.balance}</span>

      {balance.purchases > 0 && (
        <span className="text-muted-foreground text-xs">
          платежей: {balance.purchases} · {balance.stars} ⭐
        </span>
      )}
    </div>
  );
};
