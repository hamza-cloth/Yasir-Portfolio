import type { LanguageRegistration } from "shiki";

// A small TextMate grammar for Cisco IOS configs and show commands. Shiki ships none.
// Scopes map onto the css-variables theme: keyword, parameter, function, constant, comment.
export const CISCO_GRAMMAR: LanguageRegistration = {
  name: "cisco",
  scopeName: "source.cisco",
  aliases: ["ios"],
  repository: {},
  patterns: [
    { match: "^\\s*!.*$", name: "comment.line.cisco" },
    {
      match: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}(?:/\\d{1,2})?\\b",
      name: "constant.numeric.address.cisco",
    },
    {
      match:
        "\\b(?:GigabitEthernet|FastEthernet|Serial|Loopback|Vlan|gi|fa|Gi|Fa)\\d+(?:/\\d+)*(?:\\.\\d+)?\\b",
      name: "entity.name.function.interface.cisco",
    },
    {
      match:
        "^\\s*(?:no\\s+)?(?:interface|router|vlan|ip|ipv6|switchport|encapsulation|network|router-id|passive-interface|permit|deny|description|name|spanning-tree|default-router|dns-server|show|ping|traceroute|hostname|shutdown)\\b",
      name: "keyword.control.cisco",
    },
    {
      match:
        "\\b(?:area|any|host|in|out|overload|inside|outside|source|list|extended|standard|mode|access|trunk|allowed|portfast|helper-address|dhcp|pool|excluded-address|nat|access-group|access-list|route|ospf|brief|log|range|dot1Q|dot1q)\\b",
      name: "variable.parameter.cisco",
    },
  ],
};
