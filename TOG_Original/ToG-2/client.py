import itertools  # Imports tools for combining iterables; used here to flatten nested server results.
import xmlrpc.client  # Imports XML-RPC client support so Python can call methods on the Wikidata server.
import typing as tp  # Imports type hints like List and Dict to make inputs/outputs easier to understand.
import requests  # Imports HTTP requests so the code can download Wikipedia pages.
from bs4 import BeautifulSoup  # Imports an HTML parser so Wikipedia text can be extracted from page markup.


# --- Step: Formatting Entity Names For Wikipedia ---
def format_entity_name_for_wikipedia(entity_name):  # Defines a helper that converts a readable entity name into Wikipedia URL format.
    return entity_name.replace(' ', '_')  # Replaces spaces with underscores because Wikipedia URLs use names like "Albert_Einstein".


# --- Step: Single Wikidata Server Client ---
# This class wraps one Wikidata XML-RPC server.
# Input: one server URL.
# Output: methods that convert labels/QIDs/PIDs, retrieve graph relations, expand entities, and fetch Wikipedia text.
class WikidataQueryClient:
    def __init__(self, url: str):  # Initializes one client connected to one Wikidata service URL.
        self.url = url  # Stores the server URL so it can be reused and printed in error messages.
        self.server = xmlrpc.client.ServerProxy(url)  # Creates a proxy object; method calls on it are sent to the remote Wikidata server.

    # --- Step: Entity / Relation ID Conversion ---
    def label2qid(self, label: str) -> str:  # Converts an entity label like "France" into a Wikidata QID.
        return self.server.label2qid(label)  # Calls the server because QID lookup is stored in the Wikidata database.

    def label2pid(self, label: str) -> str:  # Converts a relation/property label like "capital" into a Wikidata PID.
        return self.server.label2pid(label)  # Calls the server so relation search can use exact Wikidata property IDs.

    def pid2label(self, pid: str) -> str:  # Converts a Wikidata property ID back into a readable relation name.
        return self.server.pid2label(pid)  # Calls the server to show human-readable relation labels in prompts/logs.

    def qid2label(self, qid: str) -> str:  # Converts a Wikidata entity QID into a readable entity label.
        return self.server.qid2label(qid)  # Calls the server so graph traversal results can be shown as names, not only IDs.

    # --- Step: Relation Search Around A QID ---
    def get_all_relations_of_an_entity(
        self, entity_qid: str
    ) -> tp.Dict[str, tp.List]:  # Gets all relations connected to one entity QID, grouped by direction.
        return self.server.get_all_relations_of_an_entity(entity_qid)  # Asks Wikidata which incoming/outgoing relations can expand this entity in ToG-2.

    # --- Step: Entity Expansion Through A Relation ---
    def get_tail_entities_given_head_and_relation(
        self, head_qid: str, relation_pid: str
    ) -> tp.Dict[str, tp.List]:  # Gets neighbor entities reached from a head QID through one relation PID.
        return self.server.get_tail_entities_given_head_and_relation(
            head_qid, relation_pid
        )  # Returns candidate tail QIDs used as next-hop entities during graph traversal.

    def get_tail_values_given_head_and_relation(
        self, head_qid: str, relation_pid: str
    ) -> tp.List[str]:  # Gets literal values, not entity QIDs, for a head entity and relation.
        return self.server.get_tail_values_given_head_and_relation(
            head_qid, relation_pid
        )  # Supports relations whose answers are dates, numbers, strings, or other non-entity values.

    def get_external_id_given_head_and_relation(
        self, head_qid: str, relation_pid: str
    ) -> tp.List[str]:  # Gets external database IDs linked from a Wikidata entity through a relation.
        return self.server.get_external_id_given_head_and_relation(
            head_qid, relation_pid
        )  # Supports graph facts that point outside Wikidata, though ToG-2 mainly uses QIDs and text evidence.

    # --- Step: Wikipedia Retrieval For An Entity ---
    # Flow: choose a Wikipedia title from entity name or QID, download the page, remove noisy HTML,
    # optionally extract one section, otherwise return the summary text for retrieval/LLM reasoning.
    def get_wikipedia_page(self, ent_dict, section: str = None) -> str:  # Retrieves readable Wikipedia text for an entity dictionary.
        try:  # Wraps network and parsing operations so failures return "Not Found!" instead of crashing ToG-2.
            if ent_dict.get('name') and ent_dict['name'] != "Not Found!":  # If the entity already has a valid label, use it as the Wikipedia title.
                entity_name = format_entity_name_for_wikipedia(ent_dict['name'])  # Converts the label into URL-safe Wikipedia title format.
            elif ent_dict['id'] != 'None':  # If no label is available but a QID exists, ask the server for its Wikipedia page title.
                qid = ent_dict['id']  # Stores the entity QID so it can be passed to the Wikidata server.
                entity_name = self.server.get_wikipedia_link(qid)  # Queries the server for the Wikipedia title linked to this QID.
                entity_name = entity_name[0]  # Takes the first returned title because the server returns a list-like result.
            else:  # If neither a usable name nor QID exists, Wikipedia retrieval cannot run.
                return "Not Found!"  # Returns a sentinel value so later retrieval code can skip this entity.

            if entity_name == "Not Found!":  # Checks whether the server failed to find a Wikipedia title.
                return "Not Found!"  # Returns the same sentinel to mark missing retrieval evidence.
            else:  # Runs the actual Wikipedia download when a title is available.
                wikipedia_url = 'https://en.wikipedia.org/wiki/{}'.format(entity_name)  # Builds the English Wikipedia URL for the entity.
                print('wikipedia_url  ' + wikipedia_url)  # Logs the URL so failed retrievals can be debugged.

                response = requests.get(wikipedia_url, headers={'Connection': 'close'}, timeout=180)  # Downloads the page with a timeout so the run does not hang forever.
                response.raise_for_status()  # Raises an error for HTTP failures like 404 or 500 so the except block can handle them.

                soup = BeautifulSoup(response.content, "html.parser")  # Parses the downloaded HTML into a searchable document tree.
                content_div = soup.find("div", {"id": "bodyContent"})  # Selects Wikipedia's main content area instead of menus/navigation.

                # Remove script and style elements
                for script_or_style in content_div.find_all(["script", "style"]):  # Finds JavaScript and CSS blocks that are not useful evidence.
                    script_or_style.decompose()  # Removes those blocks so retrieval/LLM reasoning sees only readable text.

                if section:  # If a specific page section was requested, extract only that section.
                    header = content_div.find(
                        lambda tag: tag.name == "h2" and section in tag.get_text()
                    )  # Finds an h2 heading whose text contains the requested section name.
                    if header:  # If the section heading exists, collect text after it.
                        content = ""  # Starts an empty string for the section text.
                        for sibling in header.find_next_siblings():  # Walks through HTML elements after the section header.
                            if sibling.name == "h2":  # Stops when the next h2 begins because that means a new section starts.
                                break  # Ends section extraction.
                            content += sibling.get_text()  # Adds the visible text from this section element.
                        return content.strip()  # Removes extra whitespace and returns the section as evidence text.
                    else:  # Handles the case where the requested section is absent.
                        return f"Section '{section}' not found."  # Returns a clear message instead of silently returning unrelated text.

                summary_content = ""  # Starts an empty string for the page summary before the first major heading.
                for element in content_div.find_all(recursive=False):  # Iterates over top-level content blocks in the Wikipedia body.
                    if element.name == "h2":  # The first h2 usually marks the end of the summary/introduction.
                        break  # Stops collecting once the summary section is finished.
                    summary_content += element.get_text()  # Adds readable text from each top-level summary block.

                return summary_content.strip()  # Returns clean summary text used later for passage retrieval and LLM reasoning.

        except requests.exceptions.RequestException as e:  # Catches network, timeout, and HTTP errors from requests.
            print(f"Error fetching Wikipedia page: {e}")  # Logs the retrieval error for debugging.
            return "Not Found!"  # Returns a safe missing-value marker so ToG-2 can continue with other entities.

    def mid2qid(self, mid: str) -> str:  # Converts an older Freebase MID into a Wikidata QID.
        return self.server.mid2qid(mid)  # Calls the server because MID-to-QID mapping is stored in the Wikidata index.


# --- Step: Multi-Server Query Support ---
import time  # Imports timing tools so connection testing can report elapsed time.
import typing as tp  # Re-imports typing for this section; this keeps the original file behavior unchanged.
from concurrent.futures import ThreadPoolExecutor  # Imports a thread pool so multiple Wikidata servers can be queried in parallel.


# This class manages several WikidataQueryClient objects.
# Input: a list of server URLs.
# Output: one query_all method that asks every server and merges their results for robust graph search.
class MultiServerWikidataQueryClient:
    def __init__(self, urls: tp.List[str]):  # Initializes the multi-server client from a list of Wikidata service URLs.
        self.clients = [WikidataQueryClient(url) for url in urls]  # Creates one single-server client per URL.
        self.executor = ThreadPoolExecutor(max_workers=len(urls))  # Creates worker threads so server calls can run at the same time.

    # --- Step: Testing Wikidata Server Connections ---
    # Flow: call a harmless XML-RPC method on every server, keep only working servers, and fail early if none work.
    def test_connections(self):  # Checks which configured Wikidata servers are reachable.
        def test_url(client):  # Defines a small helper that tests one server client.
            try:  # Tries to call the server and treats success as a working connection.

                client.server.system.listMethods()  # Calls a built-in XML-RPC method to confirm the server responds.
                return True  # Marks this server as usable.
            except Exception as e:  # Catches connection errors, XML-RPC errors, and other server failures.
                print(f"Failed to connect to {client.url}. Error: {str(e)}")  # Logs which URL failed and why.
                return False  # Marks this server as unusable.

        start_time = time.perf_counter()  # Records the start time for connection testing.
        futures = [
            self.executor.submit(test_url, client) for client in self.clients
        ]  # Submits one connection test per server so tests happen in parallel.
        results = [f.result() for f in futures]  # Waits for all connection tests and collects True/False results.
        end_time = time.perf_counter()  # Records the end time after all tests complete.
        print(f"Testing connections took {end_time - start_time} seconds")  # Logs how long server validation took.

        self.clients = [
            client for client, result in zip(self.clients, results) if result
        ]  # Keeps only the clients whose connection test succeeded.
        if not self.clients:  # If every server failed, ToG-2 cannot do relation search or entity expansion.
            raise Exception("Failed to connect to all URLs")  # Stops the program early with a clear error.

    # --- Step: Querying All Wikidata Servers ---
    # Flow: call the same method on every working server, collect results, remove missing values,
    # flatten list results, merge dictionary relation/entity results, and return one combined result.
    def query_all(self, method, *args):  # Runs a named Wikidata method on all connected servers with the provided arguments.
        # start_time = time.perf_counter()
        futures = [
            self.executor.submit(getattr(client, method), *args) for client in self.clients
        ]  # Uses getattr to choose the method by name, then calls it on every client in parallel.

        is_dict_return = method in [
            "get_all_relations_of_an_entity",
            "get_tail_entities_given_head_and_relation",
        ]  # These methods return {"head": [...], "tail": [...]} dictionaries instead of simple lists/strings.
        results = [f.result() for f in futures]  # Waits for every server response and stores all raw results.
        # end_time = time.perf_counter()

        # start_time = time.perf_counter()
        real_results = (
            set() if not is_dict_return else {"head": [], "tail": []}
        )  # Uses a set for normal outputs to remove duplicates, or a head/tail dict for graph relation outputs.
        for res in results:  # Merges each server's answer into one combined result.
            if isinstance(res, str) and res == "Not Found!":  # Skips missing-result markers from servers.
                continue  # Moves to the next server result because this one adds no evidence or graph data.
            elif isinstance(res, tp.List):  # Handles list-style results such as multiple QIDs, PIDs, values, or titles.
                if len(res) == 0:  # Empty lists mean the server found nothing useful.
                    continue  # Skips empty results.
                if isinstance(res[0], tp.List):  # Some server methods return nested lists.
                    res_flattened = itertools.chain(*res)  # Flattens nested lists into one stream of items.
                    real_results.update(res_flattened)  # Adds flattened items to the result set while removing duplicates.
                    continue  # Skips the normal list update because this result was already flattened.
                real_results.update(res)  # Adds simple list items to the result set.
            elif is_dict_return:  # Handles relation/entity-expansion methods that return head/tail dictionaries.
                real_results["head"].extend(res["head"])  # Adds incoming/head-side relation or entity results.
                real_results["tail"].extend(res["tail"])  # Adds outgoing/tail-side relation or entity results.
            else:  # Handles single values such as one QID label or one PID label.
                real_results.add(res)  # Adds the single result to the set.
        # end_time = time.perf_counter()

        return real_results if len(real_results) > 0 else "Not Found!"  # Returns merged server results, or "Not Found!" if every server failed to provide data.


# --- Step: Manual Client Test ---
if __name__ == "__main__":  # Runs the code below only when this file is executed directly, not when imported by main_tog2.py.

    with open("server_urls.txt", "r") as f:  # Opens the local file that lists Wikidata server URLs.
        server_addrs = f.readlines()  # Reads all server URL lines from the file.
        server_addrs = [addr.strip() for addr in server_addrs]  # Removes newline characters so each URL can be used by XML-RPC.
    print(f"Server addresses: {server_addrs}")  # Prints the loaded server URLs for debugging.

    wiki_client = MultiServerWikidataQueryClient(server_addrs)  # Creates the multi-server client used for graph queries.

    entity_candidates_id=['Q47887']  # Creates a small test list with one Wikidata QID.
    entity_candidates_id=['Q142']  # Replaces the previous test list with Q142, so only this QID is used below.

    # method 1
    # related_passage = wiki_client.clients[0].get_wikipedia_page(entity_candidates_id[0])
    # print('related_passage')
    # print(related_passage)
    # print(type(related_passage)) # str

    # method 2

    related_passage = wiki_client.query_all(
        "get_wikipedia_page", entity_candidates_id[0]
    )  # Calls get_wikipedia_page through all servers for this test QID and merges the returned page text.
    #print(related_passage)
    print(type(related_passage)) # set
    print(len(related_passage))  # Prints how many unique returned text chunks/items were merged.
    related_passage = "".join(related_passage)  # Joins returned text pieces into one string for inspection or later retrieval.
