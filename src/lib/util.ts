import { Group } from "@models";

export function getNumOfItems(group: Group): number {
  let sum = 0;
  for (const g of group?.serverGroups || []) {
    // eslint-disable-next-line
    sum += g.server.length;
    sum += getNumOfItems(g) + 1;
  }
  return sum;
}
