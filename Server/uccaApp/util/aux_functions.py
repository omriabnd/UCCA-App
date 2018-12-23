import re, pdb
from uccaApp.util.exceptions import SaveTaskTypeDeniedException, CantChangeSubmittedTaskExeption, GetForInactiveTaskException, TreeIdInvalid, TokensInvalid


def is_tree_ids_uniq_and_consecutive(tree_ids_list):
    """
    Receives a list of tree_ids and returns True if they are consecutive, in the right order, and unique.
    """
    splitter = lambda x: [int(y) for y in x.split('-')]
    if tree_ids_list[0] != "0":
        return False
    if len(tree_ids_list) > 1:
        if tree_ids_list[1] != "1":
            return False
        for ind,tree_id in enumerate(tree_ids_list[2:]):
            cur_index = splitter(tree_ids_list[ind+2])
            prev_index = splitter(tree_ids_list[ind+1])
            len_cur = len(cur_index)
            print(cur_index,prev_index+[1])

            if prev_index + [1] == cur_index:
                continue
            elif (len(cur_index) == len(prev_index)) and cur_index[:-1] == prev_index[:-1] and cur_index[-1] == prev_index[-1] + 1:
                continue
            elif len(cur_index) < len(prev_index) and (cur_index[:(len_cur-1)] == prev_index[:(len_cur-1)]) \
                    and (cur_index[len_cur-1] == prev_index[len_cur-1]+1):
                continue
            else:
                return False
    return True


def is_correct_format_tree_id(tree_id):
    """
    Verifies the correct format of the tree_id index.
    """
    return bool(re.match("^[0-9]+(-[0-9]+)*$", tree_id))


def is_correct_format_tree_id_child(parent_tree_id, child_tree_id):
    """
    Verifies that the child tree_id and the parent's tree_id match.
    """
    if '-' not in child_tree_id:
        return (parent_tree_id == '0')
    else:
        parent_ids = parent_tree_id.split('-')
        child_ids = child_tree_id.split('-')
        return len(child_ids) == len(parent_ids)+1 and all([p==c for p,c in zip(parent_ids,child_ids)])


def strictly_increasing(L):
    """
    Returns True if every element in L is bigger than its predecessor.
    L is a list
    """
    return all(x<y for x, y in zip(L, L[1:]))

def check_children_tokens(children_tokens_items_list):
    """
    Receives a list of pairs: a unit ID and a pair of (parent_tree_id, is_remote_copy, children_tokens).
    children_tokens is a list of start_index values of the tokens.
    Implcit units have None instead of children_tokens
    Returns True iff it's valid
    """
    children_tokens_dict = dict(children_tokens_items_list)
    for annotation_unit,entry in children_tokens_items_list:
        parent_tree_id = entry[0]
        is_remote_copy = entry[1]
        children_tokens = entry[2]
        if children_tokens:
            if not strictly_increasing(children_tokens):
                print(children_tokens)
                raise TokensInvalid("children_tokens is not properly ordered by start_index")
            if annotation_unit != '0' and not is_remote_copy and not set(children_tokens).issubset(set(children_tokens_dict[parent_tree_id][2])):
            # if annotation_unit != '0' and not is_remote_copy and parent_tree_id != '0' and not set(children_tokens).issubset(set(children_tokens_dict[parent_tree_id][2])):
                raise TokensInvalid("children_tokens is not a sub-set of its parent's children_tokens")

        # validating that:
        # (1) implicits are first, then by minimal start_index
        # (2) no overlap between tokens of siblings, unless they're remote
        child_units = [(k,v) for k,v in children_tokens_items_list if v[0] == annotation_unit]
        non_implicit_seen = False
        last_start_index = -1  # the last start_index of any child under this unit
        observed_start_indices = set() # the start_indices of all observed children so far
        for child_id,child_entry in child_units:
            if child_entry[2] == None: # implicit child
                if non_implicit_seen:
                    raise TokensInvalid("Implicit units must be the first siblings")
            else: # not implicit child
                non_implicit_seen = True
                is_remote_child = child_entry[1]
                if not is_remote_child:
                    if set(child_entry[2]) & observed_start_indices:
                        raise TokensInvalid("There cannot be an overlap in the tokens of sibling non-remote units")
                    observed_start_indices.update(child_entry[2])
                minimal_start_index = min(child_entry[2])
                if minimal_start_index <= last_start_index:
                    raise TokensInvalid("Siblings are not correctly ordered by their minimal start_index")
                last_start_index = minimal_start_index

    return True

    # try:
    #     start_index = id_to_start_index[t['id']]
    #     if start_index <= last_start_index:
    #         raise TokensInvalid("children_tokens should be ordered by their start_index within each unit.")
    #     last_start_index = start_index
    # except KeyError:
    #     raise TokensInvalid("children_tokens contains a token which is not in the task's tokens list.")

