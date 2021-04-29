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

export function normalizeURL(url: string): string {
  url = decodeURI(url);
  if (url.endsWith("/")) {
    url = url.substring(0, url.length - 1);
  }
  if (!url.startsWith("/")) {
    url = "/" + url;
  }
  return url;
}
