import { GraphQLClient } from "graphql-request";
import { print } from "graphql";

import { getSdk as getSdkWithClient, Requester } from "./__generated/sdk";

import { OPTIMIZELY_GRAPH_GATEWAY, OPTIMIZELY_GRAPH_SINGLE_KEY } from 'astro:env/client'

import { ContentPayload } from "../shared/ContentPayload";

export function getOptimizelySdk(contentPayload: ContentPayload) {
  const mode = contentPayload.ctx;
  const prevToken = contentPayload.preview_token;

  var client = new GraphQLClient(null);
  const requester: Requester<any> = async (doc: any, vars: any) => {
    if (mode === "edit" && prevToken) {
      client = new GraphQLClient(
        `${OPTIMIZELY_GRAPH_GATEWAY}/content/v2`,
        {
          headers: {
            'Authorization': `Bearer ${prevToken}`,
            'Content-Type':'application/json'
          },
        },
      );
    } else {
      client = new GraphQLClient(
        `${OPTIMIZELY_GRAPH_GATEWAY}/content/v2?auth=${OPTIMIZELY_GRAPH_SINGLE_KEY}`,
      );
    }

    try {
      const res = await client.rawRequest(print(doc), vars);
      return res?.data as any;
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error(
          "Error in GraphQL request:",
          "\n" + print(doc) + "\n",
          vars,
          "\n" + err.message,
        );
      } else {
        console.error(err);
      }
      console.error(
        "Error in GraphQL request:",
        "\n" + print(doc) + "\n",
        vars,
        "\n" + err.message,
      );
    }
  };

  return getSdkWithClient(requester);
}
