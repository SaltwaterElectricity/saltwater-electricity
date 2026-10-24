
import json
import os
from pathlib import Path
from graphify.detect import detect
from graphify.extract import collect_files, extract
from graphify.paths import out_path
from graphify.watch import _read_build_excludes, _read_build_gitignore
from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json

def run():
    root = Path('.')
    out = Path('graphify-out')
    out.mkdir(parents=True, exist_ok=True)

    print('Detecting files...')
    result = detect(root, extra_excludes=_read_build_excludes(out_path()), gitignore=_read_build_gitignore(out_path()))
    (out / '.graphify_detect.json').write_text(json.dumps(result, ensure_ascii=False), encoding='utf-8')
    print(f'Detected {result["total_files"]} files')

    print('Extracting AST...')
    code_files = []
    for f in result.get('files', {}).get('code', []):
        code_files.extend(collect_files(Path(f)) if Path(f).is_dir() else [Path(f)])
    
    if code_files:
        ast_res = extract(code_files, cache_root=root, root=root)
        (out / '.graphify_ast.json').write_text(json.dumps(ast_res, indent=2, ensure_ascii=False), encoding='utf-8')
        print(f'AST: {len(ast_res["nodes"])} nodes, {len(ast_res["edges"])} edges')
    else:
        (out / '.graphify_ast.json').write_text(json.dumps({'nodes':[],'edges':[],'input_tokens':0,'output_tokens':0}), encoding='utf-8')
        print('No code files found.')

    (out / '.graphify_semantic.json').write_text(json.dumps({'nodes':[],'edges':[],'hyperedges':[],'input_tokens':0,'output_tokens':0}), encoding='utf-8')

    print('Merging extraction...')
    ast = json.loads((out / '.graphify_ast.json').read_text(encoding='utf-8'))
    sem = json.loads((out / '.graphify_semantic.json').read_text(encoding='utf-8'))
    merged_nodes = list(ast['nodes'])
    merged_edges = ast['edges'] + sem['edges']
    merged = {
        'nodes': merged_nodes, 
        'edges': merged_edges, 
        'hyperedges': sem.get('hyperedges', []), 
        'input_tokens': 0, 
        'output_tokens': 0
    }
    (out / '.graphify_extract.json').write_text(json.dumps(merged, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f'Merged: {len(merged_nodes)} nodes, {len(merged_edges)} edges')

    print('Building graph...')
    extraction = json.loads((out / '.graphify_extract.json').read_text(encoding='utf-8'))
    G = build_from_json(extraction, root=root, directed=False)
    
    if G.number_of_nodes() == 0:
        print('ERROR: Graph is empty.')
        return

    communities = cluster(G)
    cohesion = score_all(G, communities)
    gods = god_nodes(G)
    surprises = surprising_connections(G, communities)
    labels = {cid: 'Community ' + str(cid) for cid in communities}
    questions = suggest_questions(G, communities, labels)
    
    to_json(G, communities, 'graphify-out/graph.json')
    print(f'Graph built: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges, {len(communities)} communities')

if __name__ == '__main__':
    run()
