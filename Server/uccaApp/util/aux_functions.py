import re

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

